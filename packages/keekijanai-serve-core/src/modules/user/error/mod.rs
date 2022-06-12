use axum::http::StatusCode;
use keekijanai_serve_macro::KeekijanaiRespErr;

#[derive(Debug, thiserror::Error, KeekijanaiRespErr)]
#[error("User not found")]
#[resp_err(code = "User/NotFound", status = "StatusCode::NOT_FOUND")]
pub struct UserNotFound(pub i64);
