use axum::{http::StatusCode, response::IntoResponse, Json};
use serde::Serialize;

#[derive(Debug, thiserror::Error)]
pub struct ServeError {
    pub code: &'static str,
    pub status: axum::http::StatusCode,
    pub params: Vec<String>,
    pub source: Option<anyhow::Error>,
}

pub type ServeResult<T> = core::result::Result<T, ServeError>;

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
            source: None,
        }
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
    fn into_response(mut self) -> axum::response::Response {
        if self.source.is_some() {
            let native_err = self.source.take().unwrap();
            tracing::error!("source error {}", native_err);
        }
        let status = self.status.clone();
        let code = self.code.clone();
        let payload: ErrResp = self.into();

        let mut resp = IntoResponse::into_response((status, Json(payload)));
        let headers = resp.headers_mut();
        headers.insert(SERVE_ERROR_HEADER_KEY, code.parse().unwrap());
        resp
    }
}

impl From<anyhow::Error> for ServeError {
    fn from(err: anyhow::Error) -> Self {
        let mut serve_err = ServeError::default();
        serve_err.source = Some(err);
        serve_err
    }
}

macro_rules! impl_from_any_for_serve_err {
    ($($x:ty),+) => (
        $(
            impl From<$x> for ServeError {
                fn from(err: $x) -> Self {
                    ServeError::from(anyhow::Error::from(err))
                }
            }
        )+
    );
}

impl_from_any_for_serve_err! {
    sqlx::Error,
    reqwest::Error,
    jsonwebtoken::errors::Error,
    derive_builder::UninitializedFieldError,
    teloxide::RequestError
}
