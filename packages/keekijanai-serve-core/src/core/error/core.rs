use axum::{http::StatusCode, response::IntoResponse, Json};
use serde::Serialize;

#[derive(Debug, thiserror::Error)]
pub struct ServeError {
    pub code: &'static str,
    pub status: axum::http::StatusCode,
    pub params: Vec<String>,
}

pub(crate) static SERVE_ERROR_HEADER_KEY: &'static str = "X-Keekijanai-Error";

#[derive(Debug, Serialize)]
struct ErrResp {
    code: String,
    params: Vec<String>,
}

impl std::fmt::Display for ServeError {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        write!(f, "RespErr: ({}) {:?}", self.code, self.params)
    }
}

impl Default for ServeError {
    fn default() -> Self {
        ServeError {
            code: "Internal/InternalError",
            status: StatusCode::INTERNAL_SERVER_ERROR,
            params: std::vec::Vec::new(),
        }
    }
}

impl From<anyhow::Error> for ServeError {
    fn from(err: anyhow::Error) -> Self {
        // when convert `anyhow::Error` to `ServeError`, error was converted into a response
        // so log error detail here
        tracing::error!("from anyhow::Error: {}", err);

        Default::default()
    }
}

impl From<ServeError> for ErrResp {
    fn from(err: ServeError) -> Self {
        Self {
            code: err.code.to_string(),
            params: err.params,
        }
    }
}

impl IntoResponse for ServeError {
    fn into_response(self) -> axum::response::Response {
        let status = self.status.clone();
        let code = self.code.clone();
        let payload: ErrResp = self.into();

        let mut resp = IntoResponse::into_response((status, Json(payload)));
        let headers = resp.headers_mut();
        headers.insert(SERVE_ERROR_HEADER_KEY, code.parse().unwrap());
        resp
    }
}
