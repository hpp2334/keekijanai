use axum::http::StatusCode;
use keekijanai_serve_macro::KeekijanaiRespErr;

#[derive(Debug, thiserror::Error, KeekijanaiRespErr)]
#[error("OAuth2 Login Fail")]
#[resp_err(code = "Auth/OAuth2", status = "StatusCode::UNAUTHORIZED")]
pub struct OAuth2(pub String);

#[derive(Debug, thiserror::Error, KeekijanaiRespErr)]
#[error("Not Login")]
#[resp_err(code = "Auth/NotLogin", status = "StatusCode::UNAUTHORIZED")]
pub struct NotLogin;

#[derive(Debug, thiserror::Error, KeekijanaiRespErr)]
#[error("User Not Found ({0})")]
#[resp_err(code = "Auth/UserNotFound", status = "StatusCode::UNAUTHORIZED")]
pub struct UserNotFound(pub String);

#[derive(Debug, thiserror::Error, KeekijanaiRespErr)]
#[error("User exists")]
#[resp_err(code = "Auth/UserExists", status = "StatusCode::UNAUTHORIZED")]
pub struct UserExists(pub String);

#[derive(Debug, thiserror::Error, KeekijanaiRespErr)]
#[error("Expired Token")]
#[resp_err(code = "Auth/ExpiredToken", status = "StatusCode::UNAUTHORIZED")]
pub struct ExpiredToken;

#[derive(Debug, thiserror::Error, KeekijanaiRespErr)]
#[error("Has login (user = {0})")]
#[resp_err(code = "Auth/HasLogin", status = "StatusCode::FORBIDDEN")]
pub struct HasLogin(pub i64);

#[derive(Debug, thiserror::Error, KeekijanaiRespErr)]
#[error("Password not match ({0})")]
#[resp_err(code = "Auth/PasswordNotMatch", status = "StatusCode::UNAUTHORIZED")]
pub struct PasswordNotMatch(pub String);

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
#[resp_err(code = "User/InsufficientPrivilege", status = "StatusCode::FORBIDDEN")]
pub struct InsufficientPrivilege(pub i64, pub &'static str, pub OpType, pub String);
