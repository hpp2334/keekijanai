use http::StatusCode;
use keekijanai_serve_core::{
    get_keekijanai_endpoint, init, poem::Endpoint, poem::IntoResponse as PoemIntoResponse,
};
use std::{collections::HashMap, env, error::Error, str::FromStr};
use vercel_lambda::{error::VercelError, lambda, IntoResponse, Request, Response};

fn from_vercel_request(req: vercel_lambda::Request) -> keekijanai_serve_core::poem::Request {
    let uri = req.uri();
    let query_str = uri.query().unwrap_or("");
    let mut query = querystring::querify(query_str)
        .into_iter()
        .collect::<HashMap<&str, &str>>();
    let query_route = *query.get("query_route").unwrap_or(&"");
    let query_route = urlencoding::decode(query_route).unwrap();
    query.remove("query_route");
    let new_query_str = querystring::stringify(query.into_iter().collect());

    let new_uri = keekijanai_serve_core::poem::http::Uri::builder()
        .scheme(uri.scheme_str().unwrap())
        .authority(uri.authority_part().unwrap().as_str())
        .path_and_query(format!(
            "{}{}?{}",
            uri.path(),
            query_route,
            new_query_str.as_str()
        ))
        .build()
        .unwrap();

    let method =
        keekijanai_serve_core::poem::http::Method::from_str(&req.method().to_string()).unwrap();

    let builder = keekijanai_serve_core::poem::Request::builder()
        .uri(new_uri)
        .method(method);

    let builder = req.headers().iter().fold(builder, |builder, (key, value)| {
        builder.header(key.as_str(), value.as_bytes())
    });

    let body = req.into_body();
    let keekijanai_req;
    if !body.is_empty() {
        let chunks = body.to_vec();
        keekijanai_req = builder.body(chunks);
    } else {
        keekijanai_req = builder.finish();
    }

    keekijanai_req
}

async fn from_keekijanai_response(
    resp: keekijanai_serve_core::poem::Response,
) -> vercel_lambda::Response<Vec<u8>> {
    let mut builder = vercel_lambda::Response::builder();
    builder.status(resp.status().as_u16());

    resp.headers().into_iter().for_each(|(key, value)| {
        builder.header(key.as_str(), value.as_bytes());
    });

    let body = resp.into_body();
    let body_bytes = body.into_bytes().await.unwrap();

    let vercel_resp = builder.body(body_bytes.to_vec()).unwrap();
    vercel_resp
}

pub fn process(req: Request) -> Result<impl IntoResponse, VercelError> {
    // tracing_subscriber::fmt::init();
    let resp = tokio::runtime::Builder::new_multi_thread()
        .enable_all()
        .build()
        .unwrap()
        .block_on(async {
            let _r = init().await;
            let app = get_keekijanai_endpoint();

            let req = from_vercel_request(req);
            let resp = app.call(req).await.unwrap();
            let resp = resp.into_response();
            let resp = from_keekijanai_response(resp).await;
            resp
        });

    Ok(resp)
}
