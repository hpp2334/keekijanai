use axum::{
    http::{Request, StatusCode},
    middleware::Next,
    response::{IntoResponse, Response},
};
use hyper::body::to_bytes;

use crate::core::{error::comm_error::OtherError, ServeError};

/// axum will transform error to response, which should not be exposed to client
pub async fn conver_resp_error_middleware<B>(req: Request<B>, next: Next<B>) -> impl IntoResponse {
    let resp = next.run(req).await;
    let status = resp.status();

    if status.is_client_error() || status.is_server_error() {
        let body = resp.into_body();
        let body = to_bytes(body).await.unwrap();
        let body = match String::from_utf8(body.to_vec()) {
            Ok(body) => body,
            Err(_) => "unparsed message".into(),
        };
        tracing::error!("response error message: {:?}", body);

        if status.is_server_error() {
            return ServeError::default().into_response();
        } else {
            let serve_error: ServeError = OtherError(body).into();
            return serve_error.into_response();
        }
    }
    return resp;
}
