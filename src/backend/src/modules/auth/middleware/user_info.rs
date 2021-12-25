use std::sync::Arc;

use async_trait::async_trait;
use poem::{Endpoint, Middleware, Request};
use serde::{Deserialize, Serialize};

use crate::{core::{setting::SETTING, Service}, modules::{user::{model::User, service::UserService}, auth::service::AuthService}};
use std::fmt::Debug;

#[derive(Debug, Deserialize, Serialize)]
struct Claims {
    exp: usize,
    user_id: i64,
}

pub type UserInfo = User;

pub struct UserInfoMiddleware;

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

impl<E> Debug for UserInfoMiddlewareImpl<E> {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        write!(f, "UserInfoMiddleware")
    }
}

#[async_trait]
impl<E: Endpoint> Endpoint for UserInfoMiddlewareImpl<E> {
    type Output = E::Output;

    #[tracing::instrument]
    async fn call(&self, mut req: Request) -> poem::Result<Self::Output> {
        let user_info = req.extensions().get::<UserInfo>();
        tracing::info!("user_info {:#?}", user_info);
        
        if user_info.is_none() {
            let user_service = UserService::serve();
            let auth_service = AuthService::serve();
            let token = req.headers().get("authorization");
            if let Some(token) = token {
                tracing::info!("with token");
                let token = token.to_str().unwrap().to_owned();
                let token = auth_service.decode_token(token)?;
                let user_id = token.claims.user_id;
                tracing::info!("decode token (user_id = {})", user_id);

                let user = user_service.get(user_id).await?;
                if user.is_none() {
                    return Err(super::super::error::UserNotFound(format!("id = {}", user_id)))?;
                }

                tracing::info!("req.extensions use user (user_id = {})", user_id);
                let user = Arc::new(user.unwrap());
                req.extensions_mut().insert(user);
            } else {
                tracing::info!("without token, req.extensions use anonymous user");
                req.extensions_mut().insert(User::get_anonymous());
            }
        } else {
            tracing::info!("already have user_info, reuse it");
        }

        tracing::info!("before call");
        self.ep.call(req).await
    }
}
