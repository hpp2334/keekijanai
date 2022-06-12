use axum::http::StatusCode;
use keekijanai_serve_macro::KeekijanaiRespErr;

use super::model::CommentId;

#[derive(Debug, thiserror::Error, KeekijanaiRespErr)]
#[error("Comment not found")]
#[resp_err(code = "Comment/NotFound", status = "StatusCode::NOT_FOUND")]
pub struct CommentNotFound(pub CommentId);
