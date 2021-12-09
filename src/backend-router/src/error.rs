use hyper::{StatusCode};
use thiserror::Error;

#[derive(Error, Debug)]
pub enum KeekijanaiError {
    #[error("client error ({status:?}): {message:?}")]
    Client {
        status: StatusCode,
        message: String,
    },
    #[error(transparent)]
    Internal(#[from] anyhow::Error)
}
