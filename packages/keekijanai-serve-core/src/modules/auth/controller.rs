use axum::{
    extract::{Path, Query},
    response::{IntoResponse, Redirect},
    routing, Extension, Json, Router,
};
use serde::{Deserialize, Serialize};

use crate::{
    core::{setting::SETTING, ServeError, Service},
    modules::user::model::{User, UserVO},
};

use super::{oauth2::core::OAuth2Service, service::AuthService, UserInfo};

#[derive(Debug, Serialize)]
struct CurrentRespPayload {
    user: UserVO,
}

#[derive(Debug, Deserialize)]
pub struct Outh2LoginQuery {
    pub code: String,
}

#[derive(Debug)]
pub struct AuthController;

async fn outh2_login_url(Path(provider): Path<String>) -> Result<String, ServeError> {
    let url = AuthService::serve()
        .oauth2_mgr
        .get(&provider)?
        .get_auth_url();
    Ok(url)
}

async fn current(
    Extension(user_info): Extension<&UserInfo>,
) -> Result<Json<CurrentRespPayload>, ServeError> {
    if user_info.is_anonymous() {
        return Err(super::error::NotLogin)?;
    }
    let user = User::clone(user_info);
    let resp = CurrentRespPayload { user: user.into() };
    Ok(Json(resp))
}

async fn outh2_login(
    Path(provider): Path<String>,
    Query(Outh2LoginQuery { code }): Query<Outh2LoginQuery>,
) -> Result<Redirect, ServeError> {
    let res = AuthService::serve()
        .login_oauth2(provider.as_str(), code.as_str())
        .await?;

    let setting = SETTING.get().unwrap();
    let redirect_url = setting.auth.redirect_url.as_ref().clone().unwrap();
    let redirect_url = format!("{}?token={}", redirect_url, res.token);
    let redirect_url = redirect_url.parse::<axum::http::Uri>().unwrap();
    Ok(Redirect::permanent(&redirect_url.to_string()))
}

pub fn get_router() -> Router {
    Router::new()
        .route("/oauth2/:provider", routing::get(outh2_login_url))
        .route("/oauth2/:provider/callback", routing::get(outh2_login))
        .route("/current", routing::get(current))
}
