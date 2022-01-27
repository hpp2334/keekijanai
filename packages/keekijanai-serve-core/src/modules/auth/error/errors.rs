use keekijanai_serve_resp_err_macro::KeekijanaiRespErr;
use poem::http::StatusCode;

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
#[error("User Not Found ({0})")]
#[resp_err = "Auth/UserNotFound"]
pub struct UserNotFound(pub String);

#[derive(Debug, thiserror::Error, KeekijanaiRespErr)]
#[error("User exists")]
#[resp_err = "Auth/UserExists"]
pub struct UserExists(pub String);

#[derive(Debug, thiserror::Error, KeekijanaiRespErr)]
#[error("Expired Token")]
#[resp_err = "Auth/ExpiredToken"]
pub struct ExpiredToken;

#[derive(Debug, thiserror::Error, KeekijanaiRespErr)]
#[error("Has login (user = {0})")]
#[resp_err = "Auth/HasLogin"]
pub struct HasLogin(pub i64);

#[derive(Debug, thiserror::Error, KeekijanaiRespErr)]
#[error("Password not match ({0})")]
#[resp_err = "Auth/PasswordNotMatch"]
pub struct PasswordNotMatch(pub String);

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

impl poem::error::ResponseError for UserExists {
    fn status(&self) -> StatusCode {
        StatusCode::BAD_REQUEST
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

impl poem::error::ResponseError for PasswordNotMatch {
    fn status(&self) -> StatusCode {
        StatusCode::UNAUTHORIZED
    }
}
