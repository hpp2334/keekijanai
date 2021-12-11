use std::{sync::Arc, collections::HashMap};

use hyper::body::Bytes;

use uuid::Uuid;

#[derive(Clone)]
pub struct Request {
    pub req_id: String,
    pub info: Arc<hyper::http::request::Parts>,
    pub raw_body: Bytes,
    pub(crate) params_name: Vec<String>,
    pub(crate) params: HashMap<String, String>,
}

impl Request {
    pub async fn factory<T>(hyper_req: hyper::Request<T>, extern_req_id: Option<String>, params_name: Option<Vec<String>>) -> anyhow::Result<Request>
    where
        T: hyper::body::HttpBody + Send + Sync,
    {
        let (parts, raw_body) = hyper_req.into_parts();
        let req_id = extern_req_id.unwrap_or(Self::generate_req_id());
        let raw_body = hyper::body::to_bytes(raw_body)
            .await
            .map_err(|_e| anyhow::anyhow!("to bytes error"))?;
        Ok(Request {
            req_id,
            info: Arc::new(parts),
            raw_body,
            params_name: params_name.unwrap_or(vec![]),
            params: HashMap::new(),
        })
    }

    pub fn generate_req_id() -> String {
        return Uuid::new_v4().to_string()
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

    pub fn get_param(&self, param_name: &str) -> Option<&String> {
        let param = self.params.get(param_name);
        return param;
    }
}
