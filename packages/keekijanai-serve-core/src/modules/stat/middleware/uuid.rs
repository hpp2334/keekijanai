use async_trait::async_trait;
use poem::{web::cookie::Cookie, Endpoint, Middleware, Request};

use std::fmt::Debug;

const UUID_COOKIE_NAME: &'static str = "_keekijanai_uuid";

pub struct UuidMiddleware;

impl<E: Endpoint> Middleware<E> for UuidMiddleware {
    type Output = UuidMiddlewareImpl<E>;

    fn transform(&self, ep: E) -> Self::Output {
        UuidMiddlewareImpl { ep }
    }
}

pub struct UuidMiddlewareImpl<E> {
    ep: E,
}

impl<E> Debug for UuidMiddlewareImpl<E> {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        write!(f, "UuidMiddleware")
    }
}

#[async_trait]
impl<E: Endpoint> Endpoint for UuidMiddlewareImpl<E> {
    type Output = E::Output;

    #[tracing::instrument]
    async fn call(&self, req: Request) -> poem::Result<Self::Output> {
        let cookiejar = req.cookie();
        let cookie = cookiejar.get(UUID_COOKIE_NAME);
        if cookie.is_none() {
            let uuid = uuid::Uuid::new_v4();
            let mut cookie = Cookie::new_with_str(UUID_COOKIE_NAME, uuid.to_string());
            cookie.make_permanent();
            cookie.set_path("/");
            cookie.set_http_only(true);
            cookiejar.add(cookie);
        }
        tracing::debug!("before call req");
        self.ep.call(req).await
    }
}
