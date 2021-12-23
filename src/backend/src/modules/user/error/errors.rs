use poem::{http::StatusCode};
use serve_resp_err_macro::KeekijanaiRespErr;

#[derive(Debug)]
pub enum OpType {
    CREATE,
    READ,
    UPDATE,
    DELETE,
}

impl ToString for OpType {
    fn to_string(&self) -> String {
        match self {
            &OpType::CREATE => "CREATE".to_owned(),
            &OpType::READ => "READ".to_owned(),
            &OpType::UPDATE => "UPDATE".to_owned(),
            &OpType::DELETE => "DELETE".to_owned(),
        }
    }
}


/// InsufficientPrivilege(user_id, resource_key, operation, extra_msg)
#[derive(Debug, thiserror::Error, KeekijanaiRespErr)]
#[error("Insufficient Privilege")]
#[resp_err = "User/InsufficientPrivilege"]
pub struct InsufficientPrivilege(pub i64, pub &'static str, pub OpType, pub String);



impl poem::error::ResponseError for InsufficientPrivilege {
    fn status(&self) -> StatusCode {
        StatusCode::FORBIDDEN
    }
}
