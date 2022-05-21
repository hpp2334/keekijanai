use axum::http::StatusCode;
use keekijanai_serve_macro::KeekijanaiRespErr;
/// ResourceNotFound(resourceKey, id)
#[derive(Debug, thiserror::Error, KeekijanaiRespErr)]
#[error("Resource not found")]
#[resp_err(code = "Common/ResourceNotFound", status = "StatusCode::NOT_FOUND")]
pub struct ResourceNotFound(pub &'static str, pub String);

#[derive(Debug, thiserror::Error, KeekijanaiRespErr)]
#[error("Resource not found")]
#[resp_err(code = "Common/Internal", status = "StatusCode::INTERNAL_SERVER_ERROR")]
pub struct InternalServerError;

#[derive(Debug, thiserror::Error, KeekijanaiRespErr)]
#[error("Resource not found")]
#[resp_err(code = "Common/Other", status = "StatusCode::BAD_REQUEST")]
pub struct OtherError(pub String);
