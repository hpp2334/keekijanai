use axum::{
    http::{Request, StatusCode},
    middleware::Next,
    response::{IntoResponse, Response},
};
use hyper::body::to_bytes;

use crate::core::{error::comm_error::OtherError, ServeError};

use super::core::SERVE_ERROR_HEADER_KEY;

/// axum will transform error to response, which should not be exposed to client
pub async fn convert_resp_error_middleware<B>(req: Request<B>, next: Next<B>) -> impl IntoResponse {
    let mut resp = next.run(req).await;
    let headers = resp.headers_mut();
    let has_custom_error = headers.contains_key(SERVE_ERROR_HEADER_KEY);
    let status = resp.status();

    if !has_custom_error && (status.is_client_error() || status.is_server_error()) {
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
            let mut serve_error: ServeError = OtherError(body).into();
            serve_error.status = status;
            return serve_error.into_response();
        }
    }
    return resp;
}
