use async_trait::async_trait;

use crate::Request;

#[async_trait]
pub trait PreMiddleware {
    async fn process(&self, req: &mut Request) -> Result<(), anyhow::Error>;
}
