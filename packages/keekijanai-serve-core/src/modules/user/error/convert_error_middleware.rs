use std::fmt::Debug;

use async_trait::async_trait;
use poem::{
    Endpoint,
    Middleware, Request,
};


use crate::modules::user::model::User;

pub struct ConvertErrorMiddleware;

impl ConvertErrorMiddleware {
    pub fn new() -> Self {
        Self
    }
}

impl<E: Endpoint> Middleware<E> for ConvertErrorMiddleware {
    type Output = ConvertErrorMiddlewareImpl<E>;

    fn transform(&self, ep: E) -> Self::Output {
        ConvertErrorMiddlewareImpl {
            ep
        }
    }
}

pub struct ConvertErrorMiddlewareImpl<E> {
    ep: E,
}

impl<E> Debug for ConvertErrorMiddlewareImpl<E> {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        write!(f, "User/ConvertErrorMiddleware")
    }
}

#[async_trait]
impl<E: Endpoint> Endpoint for ConvertErrorMiddlewareImpl<E> {
    type Output = E::Output;

    #[tracing::instrument]
    async fn call(&self, req: Request) -> poem::Result<Self::Output> {
        tracing::debug!("before call req");
        let res = self.ep.call(req).await;


        match res {
            Ok(resp) => {
                Ok(resp)
            }
            Err(err) => {
                let downcasted = err.downcast::<super::InsufficientPrivilege>();
                if downcasted.is_ok() {
                    tracing::debug!("downcast error to InsufficientPrivilege");
                    let err = downcasted.unwrap();
                    if User::is_anonymous_by_id(err.0) {
                        Err(crate::modules::auth::error::NotLogin)?
                    } else {
                        Err(err)?
                    }
                } else {
                    let err = downcasted.unwrap_err();
                    Err(err)
                }
            }
        }
    }
}
