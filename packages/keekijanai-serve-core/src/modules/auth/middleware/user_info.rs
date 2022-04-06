use axum::{http::Request, middleware::Next, response::IntoResponse};
use std::sync::Arc;


use serde::{Deserialize, Serialize};

use crate::{
    core::{ServeError, Service},
    modules::{
        auth::service::AuthService,
        user::{model::User, service::UserService},
    },
};
use std::fmt::Debug;

#[derive(Debug, Deserialize, Serialize)]
struct Claims {
    exp: usize,
    user_id: i64,
}

pub type UserInfo = Arc<User>;

pub async fn user_info_middleware<B>(
    mut req: Request<B>,
    next: Next<B>,
) -> Result<impl IntoResponse, ServeError> {
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
                return Err(super::super::error::UserNotFound(format!(
                    "id = {}",
                    user_id
                )))?;
            }

            tracing::info!("req.extensions use user (user_id = {})", user_id);
            let user = Arc::new(user.unwrap());
            req.extensions_mut().insert::<UserInfo>(user);
        } else {
            tracing::info!("without token, req.extensions use anonymous user");
            req.extensions_mut()
                .insert::<UserInfo>(User::get_anonymous());
        }
    } else {
        tracing::info!("already have user_info, reuse it");
    }

    tracing::info!("before call");
    Ok(next.run(req).await)
}
