#[macro_use]
extern crate assert_matches;

mod util;

use std::{
    collections::{HashMap},
    sync::Mutex,
};

use backend_router::{
    Body, KeekijanaiError, Method, Request, Response, Router, WithResponseHelper,
};
use hyper::{StatusCode};
use once_cell::sync::OnceCell;
use reqwest;
use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize)]
struct LoginParams {
    user: String,
}

#[derive(Serialize, Deserialize, Debug, PartialEq, Eq)]
struct LoginResponse {
    current: Option<String>,
}

static USER_STORAGE: OnceCell<Mutex<HashMap<String, String>>> = OnceCell::new();

trait WithRequestUser {
    fn get_session_id(&self) -> String;
    fn get_current_user(&self) -> Option<String>;
}

impl WithRequestUser for Request {
    fn get_session_id(&self) -> String {
        let session = self.info.headers.get("test-session");
        let session_id = session.unwrap().to_str().unwrap().to_owned();
        return session_id;
    }

    fn get_current_user(&self) -> Option<String> {
        let user_storage = USER_STORAGE.get().unwrap().lock().unwrap();
        let session = self.info.headers.get("test-session");

        if let Some(session_id) = session {
            let session_id = session_id.to_str().unwrap().to_owned();
            let user = user_storage.get(&session_id).map(|u| u.to_owned());
            return user;
        }
        return None;
    }
}

async fn user_middleware(req: Request) -> anyhow::Result<Request> {
    let ignore_paths = vec![
        "/login",
        "/login/status",
    ];
    let path = req.info.uri.to_string();
    let user = req.get_current_user();
    if !ignore_paths.contains(&path.as_str()) && user.is_none() {
        return Err(KeekijanaiError::Client {
            status: StatusCode::UNAUTHORIZED,
            message: "not login".to_string(),
        }
        .into());
    }

    return Ok(req);
}

async fn login_as(req: Request) -> anyhow::Result<Response<Body>> {
    let user = req.get_current_user();
    let session_id = req.get_session_id();
    let mut user_storage = USER_STORAGE.get().unwrap().lock().unwrap();

    if user.is_some() {
        return Err(KeekijanaiError::Client {
            status: StatusCode::FORBIDDEN,
            message: "already login".to_string(),
        }
        .into());
    }
    let LoginParams { user } = req.parse_body::<LoginParams>()?;
    user_storage.insert(session_id, user);

    return Ok(Response::new("".into()));
}

async fn logout(req: Request) -> anyhow::Result<Response<Body>> {
    let mut user_storage = USER_STORAGE.get().unwrap().lock().unwrap();
    let session_id = req.get_session_id();

    user_storage.remove(session_id.as_str());

    return Ok(Response::new("".into()));
}

async fn login_current_status(req: Request) -> anyhow::Result<Response<Body>> {
    let user = req.get_current_user();

    let payload = if let Some(user) = user {
        LoginResponse {
            current: Some(user.to_owned()),
        }
    } else {
        LoginResponse { current: None }
    };

    return Response::build_json(payload);
}

pub fn build_server() -> String {
    let router = Router::builder()
        .pre_middleware(user_middleware)
        .add("/login", Method::POST, login_as)
        .add("/logout", Method::POST, logout)
        .add("/login/status", Method::GET, login_current_status)
        .build();
    util::spawn_server(router)
}

#[tokio::test]
async fn test_login_logout() {
    USER_STORAGE.set(Mutex::new(HashMap::new())).unwrap();

    let addr = build_server();
    let user = "user122Q!-";
    let session_id = "session:123";

    let params = LoginParams {
        user: user.to_owned(),
    };
    let resp = reqwest::Client::new()
        .post(format!("{}/login", addr))
        .header("test-session", session_id)
        .body(serde_json::to_string(&params).unwrap())
        .send()
        .await
        .expect("");

    assert_eq!(resp.status(), 200);

    let resp = reqwest::Client::new()
        .get(format!("{}/login/status", addr))
        .header("test-session", session_id)
        .send()
        .await
        .expect("");
    let resp_payload = resp.json::<LoginResponse>().await.expect("without payload");
    let to_match = LoginResponse {
        current: Some(user.to_owned()),
    };
    assert_eq!(resp_payload, to_match);

    let resp = reqwest::Client::new()
        .post(format!("{}/logout", addr))
        .header("test-session", session_id)
        .send()
        .await
        .expect("");

    assert_eq!(resp.status(), 200);
}

#[tokio::test]
async fn test_not_login() {
    USER_STORAGE.set(Mutex::new(HashMap::new())).unwrap();
    let addr = build_server();
    let session_id = "session:123";

    let resp = reqwest::Client::new()
        .get(format!("{}/login/status", addr))
        .header("test-session", session_id)
        .send()
        .await
        .expect("");
    let resp_payload = resp.json::<LoginResponse>().await.expect("without payload");
    let to_match = LoginResponse { current: None };
    assert_eq!(resp_payload, to_match);

    let resp = reqwest::Client::new()
        .post(format!("{}/logout", addr))
        .header("test-session", session_id)
        .send()
        .await
        .expect("");

    assert_eq!(resp.status(), 401);
}
