use poem::{http::StatusCode, Result};
use serve_resp_err_macro::KeekijanaiRespErr;

/// OAuth2(error_msg)
#[derive(Debug, thiserror::Error, KeekijanaiRespErr)]
#[error("Not Login")]
#[resp_err = "Auth/OAuth2"]
pub struct OAuth2(pub String);

#[derive(Debug, thiserror::Error, KeekijanaiRespErr)]
#[error("Not Login")]
#[resp_err = "Auth/NotLogin"]
pub struct NotLogin;

#[derive(Debug, thiserror::Error, KeekijanaiRespErr)]
#[error("Not Login")]
#[resp_err = "Auth/UserNotFound"]
pub struct UserNotFound(pub i64);

#[derive(Debug, thiserror::Error, KeekijanaiRespErr)]
#[error("Expired Token")]
#[resp_err = "Auth/ExpiredToken"]
pub struct ExpiredToken;

#[derive(Debug, thiserror::Error, KeekijanaiRespErr)]
#[error("Has login (user = {0})")]
#[resp_err = "Auth/HasLogin"]
pub struct HasLogin(String);

impl poem::error::ResponseError for OAuth2 {
    fn status(&self) -> StatusCode {
        StatusCode::BAD_REQUEST
    }
}

impl poem::error::ResponseError for NotLogin {
    fn status(&self) -> StatusCode {
        StatusCode::UNAUTHORIZED
    }
}

impl poem::error::ResponseError for UserNotFound {
    fn status(&self) -> StatusCode {
        StatusCode::UNAUTHORIZED
    }
}

impl poem::error::ResponseError for ExpiredToken {
    fn status(&self) -> StatusCode {
        StatusCode::UNAUTHORIZED
    }
}

impl poem::error::ResponseError for HasLogin {
    fn status(&self) -> StatusCode {
        StatusCode::FORBIDDEN
    }
}

