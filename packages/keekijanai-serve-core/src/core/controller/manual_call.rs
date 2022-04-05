use std::pin::Pin;

use axum::{
    body::{Body, Bytes, HttpBody},
    response::{IntoResponse, Response},
    Router,
};
use tower::ServiceExt;

pub struct EntireRequest {
    pub uri: String,
    pub headers: Vec<(String, String)>,
    pub body: String,
}

pub struct EntireResponse {
    pub status_code: u16,
    pub headers: Vec<(String, String)>,
    pub data: Bytes,
}

impl From<EntireRequest> for axum::http::Request<Body> {
    fn from(entire_req: EntireRequest) -> Self {
        let body = Body::from(entire_req.body);
        let mut builder = axum::http::Request::builder().uri(&entire_req.uri);
        let mut headers_iter = entire_req.headers.into_iter();

        while let Some((key, value)) = headers_iter.next() {
            builder = builder.header(key, value);
        }

        let req = builder.body(body).unwrap();
        req
    }
}

async fn resp_to_entire_resp(resp: Response) -> EntireResponse {
    let status_code = resp.status().as_u16();
    let headers = resp
        .headers()
        .iter()
        .map(|(key, value)| (key.to_string(), value.to_str().unwrap().to_string()))
        .collect();
    let body = resp.into_body();
    let data = hyper::body::to_bytes(body).await.unwrap();

    EntireResponse {
        status_code,
        headers,
        data,
    }
}

/// `init` method should be called before
pub(crate) async fn manual_call_with_entire_request(
    router: Router,
    req: EntireRequest,
) -> EntireResponse {
    let resp = router.oneshot(req.into()).await.unwrap();
    let resp = resp_to_entire_resp(resp).await;
    resp
}
