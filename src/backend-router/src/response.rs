use hyper::Body;
pub use hyper::{Response};
use serde::Serialize;

pub trait WithResponseHelper<T> {
    fn build_json(payload: impl Serialize) -> anyhow::Result<Response<T>>;
}

impl<T> WithResponseHelper<T> for Response<T>
    where T: From<String> {
    fn build_json(payload: impl Serialize) -> anyhow::Result<Response<T>> {
        let payload_str = serde_json::to_string(&payload)?;
        let resp = Response::builder()
            .header("content-type", "application/json")
            .body(payload_str.into())?;
        return Ok(resp);
    }
}
