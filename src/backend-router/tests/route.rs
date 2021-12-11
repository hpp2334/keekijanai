#[macro_use]
extern crate assert_matches;

mod util;



use backend_router::{Body, Method, Request, Response, Router, WithResponseHelper};

use reqwest;
use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize)]
struct AddParams {
    a: i32,
    b: i32,
}

#[derive(Serialize, Deserialize, Debug)]
struct AddResponse {
    result: i32,
}

async fn add_query(req: Request) -> anyhow::Result<Response<Body>> {
    let AddParams { a, b } = req.parse_query::<AddParams>()?;
    let result = a + b;
    let payload = AddResponse { result };

    return Response::build_json(payload);
}

async fn add_post(req: Request) -> anyhow::Result<Response<Body>> {
    let AddParams { a, b } = req.parse_body::<AddParams>()?;
    let result = a + b;
    let payload = AddResponse { result };

    return Response::build_json(payload);
}

async fn add_param(req: Request) -> anyhow::Result<Response<Body>> {
    let a = req.get_param("a").unwrap();
    let b = req.get_param("b").unwrap();

    let result = a.parse::<i32>().unwrap() + b.parse::<i32>().unwrap();
    let payload = AddResponse { result };

    return Response::build_json(payload);
}

pub fn build_server() -> String {
    let router = Router::builder()
        .add("/add", Method::GET, add_query)
        .add("/add", Method::POST, add_post)
        .add("/add/:a/:b", Method::GET, add_param)
        .build();
    util::spawn_server(router)
}

#[tokio::test]
async fn test_add_query() {
    let addr = build_server();

    let resp = reqwest::get(format!("{}/add?a=1&b=2", addr))
        .await
        .expect("");
    let res = resp.json::<AddResponse>().await.expect("");
    assert_matches!(res, AddResponse { result: 3 });
}

#[tokio::test]
async fn test_add_post() {
    let addr = build_server();

    let params = AddParams { a: 1, b: 2 };
    let resp = reqwest::Client::new()
        .post(format!("{}/add", addr))
        .body(serde_json::to_string(&params).unwrap())
        .send()
        .await
        .expect("");
    let res = resp.json::<AddResponse>().await.expect("");
    assert_matches!(res, AddResponse { result: 3 });
}

#[tokio::test]
async fn test_add_param() {
    let addr = build_server();

    let resp = reqwest::get(format!("{}/add/1/2", addr))
        .await
        .expect("request fail");

    assert_eq!(resp.status(), 200);
    let res = resp.json::<AddResponse>().await.expect("without payload");
    assert_matches!(res, AddResponse { result: 3 });
}
