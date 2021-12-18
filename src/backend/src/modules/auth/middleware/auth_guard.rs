use std::sync::Arc;

use async_trait::async_trait;
use backend_router::{PreMiddleware, Request, KeekijanaiError};
use hyper::StatusCode;
use serde::{Deserialize, Serialize};

use crate::{core::setting::SETTING, modules::user::service::UserService};
use crate::core::Service;

#[derive(Debug, Deserialize, Serialize)]
struct Claims {
    exp: usize,
    user_id: i64,
}


pub struct AuthGuardMiddleware {
    pub ignore_paths: Vec<&'static str>
}

fn map_err_to_unauthorized_error<RE>(_e: RE) -> anyhow::Error {
    return get_unauthorized_error();
}

fn get_unauthorized_error() -> anyhow::Error {
    return KeekijanaiError::Client {
        status: StatusCode::UNAUTHORIZED,
        message: "Not login".to_owned(),
    }.into()
}

#[async_trait]
impl PreMiddleware for AuthGuardMiddleware {
    async fn process(&self, req: &mut Request) -> Result<(), anyhow::Error> {
        // If user info already registered in user service
        // it is from developer
        // so just skip validate token and register user info
        if UserService::serve().has_user_info_from_req(req) {
            return Ok(());
        }

        let token = req.info.headers.get("authorization");
        if let Some(token) = token {
            let token = token.to_str().unwrap().to_owned();
            let secret = &SETTING.get().unwrap().auth.secret;

            let token = jsonwebtoken::decode::<Claims>(
                &token,
                &jsonwebtoken::DecodingKey::from_secret(secret.as_bytes()),
                &jsonwebtoken::Validation::default()
            ).map_err(map_err_to_unauthorized_error)?;
            let user_id = token.claims.user_id;


            let user = UserService::serve().get(user_id).await?;
            if user.is_none() {
                return Err(get_unauthorized_error())
            }
            let user = user.unwrap();
            UserService::serve().update_user_info_from_req(&req, &user);
        }

        return Ok(());
    }
}
