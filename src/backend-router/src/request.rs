use std::{sync::Arc};

use hyper::body::Bytes;

use uuid::Uuid;

#[derive(Clone)]
pub struct Request {
    pub req_id: String,
    pub info: Arc<hyper::http::request::Parts>,
    pub raw_body: Bytes,
}

impl Request {
    pub async fn factory<T>(hyper_req: hyper::Request<T>) -> anyhow::Result<Request>
    where
        T: hyper::body::HttpBody + Send + Sync,
    {
        let (parts, raw_body) = hyper_req.into_parts();
        let req_id = Uuid::new_v4().to_string();
        let raw_body = hyper::body::to_bytes(raw_body)
            .await
            .map_err(|_e| anyhow::anyhow!("to bytes error"))?;
        Ok(Request {
            req_id,
            info: Arc::new(parts),
            raw_body,
        })
    }

    pub fn parse_query<'a, B>(&'a self) -> anyhow::Result<B>
    where
        B: serde::de::Deserialize<'a>,
    {
        let query = self.info.uri.query().unwrap_or("");
        let deserialized: B = serde_qs::from_str(query)?;
        return Ok(deserialized);
    }

    pub fn parse_body<'a, B>(&'a self) -> anyhow::Result<B>
    where
        B: serde::de::Deserialize<'a>,
    {
        let deserialized: B = serde_json::from_slice(self.raw_body.as_ref())?;
        return Ok(deserialized);
    }
}
