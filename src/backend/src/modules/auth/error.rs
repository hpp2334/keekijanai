use poem::{http::StatusCode, Result};
use serve_resp_err_macro::KeekijanaiRespErr;

#[derive(Debug, thiserror::Error, KeekijanaiRespErr)]
#[error("Not Login")]
#[resp_err = "Auth/NotLogin"]
pub struct NotLogin;

#[derive(Debug, thiserror::Error, KeekijanaiRespErr)]
#[error("Expired Token")]
#[resp_err = "Auth/ExpiredToken"]
pub struct ExpiredToken;

#[derive(Debug, thiserror::Error, KeekijanaiRespErr)]
#[error("Has login (user = {0})")]
#[resp_err = "Auth/HasLogin"]
pub struct HasLogin(String);

impl poem::error::ResponseError for NotLogin {
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

