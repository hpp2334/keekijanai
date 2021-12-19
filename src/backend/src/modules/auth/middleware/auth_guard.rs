use async_trait::async_trait;
use poem::{web::Data, Endpoint, EndpointExt, Middleware, Request};
use serde::{Deserialize, Serialize};

use crate::{core::{setting::SETTING, Service}, modules::user::{model::User, service::UserService}};
use super::{UserInfoContext};

pub struct AuthGuardMiddleware {
    ignores: Vec<&'static str>
}

impl AuthGuardMiddleware {
    pub fn new(ignores: Vec<&'static str>) -> Self {
        Self {
            ignores
        }
    }
}

impl<E: Endpoint> Middleware<E> for AuthGuardMiddleware {
    type Output = AuthGuardMiddlewareImpl<E>;

    fn transform(&self, ep: E) -> Self::Output {
        AuthGuardMiddlewareImpl {
            ignores: self.ignores.clone(),
            ep
        }
    }
}

pub struct AuthGuardMiddlewareImpl<E> {
    ignores: Vec<&'static str>,
    ep: E,
}

#[async_trait]
impl<E: Endpoint> Endpoint for AuthGuardMiddlewareImpl<E> {
    type Output = E::Output;

    async fn call(&self, mut req: Request) -> poem::Result<Self::Output> {
        let user_info = req.extensions().get::<UserInfoContext>();
        
        let should_ignore = self.ignores.iter().any(|ignore| {
            req.uri().path().starts_with(ignore)
        });
        
        if !should_ignore && user_info.is_none() {
            return Err(anyhow::anyhow!("not login"))?;
        }

        // call the inner endpoint.
        self.ep.call(req).await
    }
}
