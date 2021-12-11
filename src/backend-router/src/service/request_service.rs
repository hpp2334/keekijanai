// modify from routerify src/service/request_service.rs
// [routerify](https://github.com/routerify/routerify)

use hyper::StatusCode;
use hyper::{body::HttpBody, service::Service, Request, Response};
use std::convert::Infallible;
use std::future::Future;
use std::net::SocketAddr;
use std::pin::Pin;
use std::sync::Arc;
use std::task::{Context, Poll};

use crate::error::KeekijanaiError;
use crate::router::Router;

pub struct RequestService<B, E> {
    pub router: Arc<Router<B, E>>,
    pub remote_addr: SocketAddr,
}

impl<B: HttpBody + From<&'static str> + From<String> + Send + Sync + 'static, E: Into<anyhow::Error> + Send + 'static>
    Service<Request<hyper::Body>> for RequestService<B, E>
{
    type Response = Response<B>;
    type Error = anyhow::Error;
    type Future =
        Pin<Box<dyn Future<Output = Result<Self::Response, Self::Error>> + Send + 'static>>;

    fn poll_ready(&mut self, _cx: &mut Context<'_>) -> Poll<Result<(), Self::Error>> {
        Poll::Ready(Ok(()))
    }

    fn call(&mut self, req: Request<hyper::Body>) -> Self::Future {
        let router = self.router.clone();

        let fut = async move {
            let res = router.process(req, None).await;

            if let Err(err) = res {
                if let Ok(KeekijanaiError::Client { status, message }) = err.downcast::<KeekijanaiError>() {
                    let err_resp =  Response::builder()
                        .status(status)
                        .body(B::from(message))
                        .unwrap();
                    return Ok(err_resp);
                } else {
                    let err_resp = Response::builder()
                        .status(StatusCode::INTERNAL_SERVER_ERROR)
                        .body(B::from("internal error"))
                        .unwrap();
                    return Ok(err_resp);
                }
            }
            return res;
        };

        Box::pin(fut)
    }
}

pub struct RequestServiceBuilder<B, E> {
    router: Arc<Router<B, E>>,
}

impl<
        B: HttpBody + Send + Sync + 'static,
        E: Into<Box<dyn std::error::Error + Send + Sync>> + 'static,
    > RequestServiceBuilder<B, E>
{
    pub fn new(router: Router<B, E>) -> Result<Self, Infallible> {
        Ok(Self {
            router: Arc::from(router),
        })
    }

    pub fn build(&self, remote_addr: SocketAddr) -> RequestService<B, E> {
        RequestService {
            router: self.router.clone(),
            remote_addr,
        }
    }
}
