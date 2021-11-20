use derive_more::{Display};

#[derive(Debug, Display)]
pub struct KKError(anyhow::Error);


impl From<anyhow::Error> for KKError {
    fn from(err: anyhow::Error) -> KKError {
        KKError(err)
    }
}
