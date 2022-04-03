use axum::{http::StatusCode, response::IntoResponse, Json};
use serde::Serialize;

#[derive(Debug, thiserror::Error)]
pub struct ServeError {
    pub code: &'static str,
    pub status: axum::http::StatusCode,
    pub params: Vec<String>,
}

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
    fn from(_: anyhow::Error) -> Self {
        todo!()
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
        let payload: ErrResp = self.into();
        IntoResponse::into_response((status, Json(payload)))
    }
}
