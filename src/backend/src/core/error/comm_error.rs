use hyper::StatusCode;
use serve_resp_err_macro::KeekijanaiRespErr;

/// ResourceNotFound(resourceKey, id)
#[derive(Debug, thiserror::Error, KeekijanaiRespErr)]
#[error("Resource not found")]
#[resp_err = "Common/ResourceNotFound"]
pub struct ResourceNotFound(pub &'static str, pub String);

impl poem::error::ResponseError for ResourceNotFound {
    fn status(&self) -> StatusCode {
        StatusCode::NOT_FOUND
    }
}
