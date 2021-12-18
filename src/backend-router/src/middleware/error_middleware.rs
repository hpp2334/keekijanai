use std::any;

use async_trait::async_trait;

use crate::Request;

#[async_trait]
pub trait ErrorMiddleware {
    async fn process(&self, req: &Request, error: &anyhow::Error);
}
