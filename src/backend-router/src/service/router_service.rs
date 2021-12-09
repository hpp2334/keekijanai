// modify from routerify src/service/router_service.rs
// [routerify](https://github.com/routerify/routerify)

use crate::router::Router;
use crate::service::request_service::{RequestService, RequestServiceBuilder};
use hyper::{body::HttpBody, server::conn::AddrStream, service::Service};
use std::convert::Infallible;
use std::future::{ready, Ready};
use std::task::{Context, Poll};
pub struct RouterService<B, E> {
    builder: RequestServiceBuilder<B, E>,
}

impl<B: HttpBody + Send + Sync + 'static, E: Into<Box<dyn std::error::Error + Send + Sync>> + 'static>
    RouterService<B, E>
{
    /// Creates a new service with the provided router and it's ready to be used with the hyper [`serve`](https://docs.rs/hyper/0.14.4/hyper/server/struct.Builder.html#method.serve)
    /// method.
    pub fn new(router: Router<B, E>) -> anyhow::Result<RouterService<B, E>> {
        let builder = RequestServiceBuilder::new(router)?;
        Ok(RouterService { builder })
    }
}

impl<B: HttpBody + Send + Sync + 'static, E: Into<Box<dyn std::error::Error + Send + Sync>> + 'static>
    Service<&AddrStream> for RouterService<B, E>
{
    type Response = RequestService<B, E>;
    type Error = Infallible;
    type Future = Ready<Result<Self::Response, Self::Error>>;

    fn poll_ready(&mut self, _cx: &mut Context<'_>) -> Poll<Result<(), Self::Error>> {
        Poll::Ready(Ok(()))
    }

    fn call(&mut self, conn: &AddrStream) -> Self::Future {
        let req_service = self.builder.build(conn.remote_addr());

        ready(Ok(req_service))
    }
}
