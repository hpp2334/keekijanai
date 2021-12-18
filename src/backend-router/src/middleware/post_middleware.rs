use std::any;

use async_trait::async_trait;

use crate::{Request, Response};

#[async_trait]
pub trait PostMiddleware<R> {
    async fn process(&self, req: &mut Request, res: &mut Response<R>) -> Result<(), anyhow::Error>;
}
