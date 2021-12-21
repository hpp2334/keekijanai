use poem::{http::StatusCode, Result};
use serve_resp_err_macro::KeekijanaiRespErr;

/// InsufficientPrivilege(user_id, resource, key)
#[derive(Debug, thiserror::Error, KeekijanaiRespErr)]
#[error("Insufficient Privilege")]
#[resp_err = "User/InsufficientPrivilege"]
pub struct InsufficientPrivilege(pub i64, pub String, pub String);



impl poem::error::ResponseError for InsufficientPrivilege {
    fn status(&self) -> StatusCode {
        StatusCode::FORBIDDEN
    }
}
