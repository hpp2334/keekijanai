use async_trait::async_trait;
use poem::{Endpoint, Middleware, Request};
use serde::{Deserialize, Serialize};

use crate::{core::{setting::SETTING, Service}, modules::user::{model::User, service::UserService}};

#[derive(Debug, Deserialize, Serialize)]
struct Claims {
    exp: usize,
    user_id: i64,
}

pub struct UserInfoContext(i64, User);


pub struct UserInfoMiddleware;

impl UserInfoMiddleware {
    pub fn new() -> Self {
        Self
    }
}

impl<E: Endpoint> Middleware<E> for UserInfoMiddleware {
    type Output = UserInfoMiddlewareImpl<E>;

    fn transform(&self, ep: E) -> Self::Output {
        UserInfoMiddlewareImpl {
            ep
        }
    }
}

pub struct UserInfoMiddlewareImpl<E> {
    ep: E,
}

#[async_trait]
impl<E: Endpoint> Endpoint for UserInfoMiddlewareImpl<E> {
    type Output = E::Output;

    async fn call(&self, mut req: Request) -> poem::Result<Self::Output> {
        let user_info = req.extensions().get::<UserInfoContext>();
        
        if user_info.is_some() {
            let user_service = UserService::serve();
            let token = req.headers().get("authorization");
            if let Some(token) = token {
                let token = token.to_str().unwrap().to_owned();
                let secret = &SETTING.get().unwrap().auth.secret;
    
                let token = jsonwebtoken::decode::<Claims>(
                    &token,
                    &jsonwebtoken::DecodingKey::from_secret(secret.as_bytes()),
                    &jsonwebtoken::Validation::default()
                ).map_err(|_e| { anyhow::anyhow!("invalid ") })?;
                let user_id = token.claims.user_id;
    
                let user = user_service.get(user_id).await?;
                if user.is_none() {
                    return Err(anyhow::anyhow!("not exist user").into());
                }

                req.extensions_mut().insert(UserInfoContext(user_id, user.unwrap()));
            }
        }

        // call the inner endpoint.
        self.ep.call(req).await
    }
}
