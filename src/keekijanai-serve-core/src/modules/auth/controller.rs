use poem::web;
use poem_openapi::{
    param,
    payload::{Json, PlainText},
    Object, OpenApi,
};
use serde::Deserialize;

use crate::{
    core::{setting::SETTING, ApiTags, Service},
    modules::user::model::{User, UserVO},
};

use super::{oauth2::core::OAuth2Service, service::AuthService, UserInfo};

#[derive(Debug, Object)]
struct LoginParams {
    username: String,
    password: String,
}

#[derive(Debug, Object)]
struct LoginRespPayload {
    user: UserVO,
    token: String,
}

#[derive(Debug, Object)]
struct RegisterParams {
    username: String,
    password: String,
}

#[derive(Debug, Object)]
struct CurrentRespPayload {
    user: UserVO,
}

#[derive(Debug, Deserialize)]
pub struct Outh2LoginQuery {
    pub code: String,
}

#[derive(Debug)]
pub struct AuthController;

#[OpenApi(prefix_path = "/keekijanai/auth", tag = "ApiTags::Auth")]
impl AuthController {
    #[oai(path = "/oauth2/:provider", method = "get")]
    async fn outh2_login_url(
        &self,
        provider: param::Path<String>,
    ) -> poem::Result<PlainText<String>> {
        let provider = (*provider).clone();
        let url = AuthService::serve()
            .oauth2_mgr
            .get(provider.as_str())?
            .get_auth_url();

        Ok(PlainText(url))
    }

    #[oai(path = "/login", method = "post")]
    async fn legacy_login(
        &self,
        user_info: web::Data<&UserInfo>,
        params: Json<LoginParams>,
    ) -> poem::Result<Json<LoginRespPayload>> {
        tracing::debug!("in legacy_login");
        if !user_info.is_anonymous() {
            return Err(super::error::HasLogin(user_info.id))?;
        }

        let auth_service = AuthService::serve();

        tracing::debug!("before call legacy_login (id = {})", user_info.id);
        let mut auth_login_res = auth_service
            .legacy_login(params.username.as_str(), params.password.as_str())
            .await?;
        auth_login_res.user.password = None;
        let resp = LoginRespPayload {
            user: auth_login_res.user.into(),
            token: auth_login_res.token,
        };
        Ok(Json(resp))
    }

    #[oai(path = "/register", method = "post")]
    async fn legacy_register(
        &self,
        params: Json<RegisterParams>,
    ) -> poem::Result<PlainText<&'static str>> {
        let auth_service = AuthService::serve();

        let _res = auth_service
            .legacy_register(params.username.as_str(), params.password.as_str())
            .await?;
        Ok(PlainText(""))
    }

    #[oai(path = "/current", method = "get")]
    async fn current(
        &self,
        user_info: web::Data<&UserInfo>,
    ) -> poem::Result<Json<CurrentRespPayload>> {
        if user_info.is_anonymous() {
            return Err(super::error::NotLogin)?;
        }
        let user = User::clone(*user_info);
        let resp = CurrentRespPayload { user: user.into() };
        Ok(Json(resp))
    }
}

#[poem::handler]
pub async fn outh2_login(
    poem::web::Path((provider,)): poem::web::Path<(String,)>,
    query: poem::web::Query<Outh2LoginQuery>,
) -> poem::Result<poem::web::Redirect> {
    let code = &query.code;

    let res = AuthService::serve()
        .login_oauth2(provider.as_str(), code.as_str())
        .await?;
    println!("oauth2_login end");

    let setting = SETTING.get().unwrap();
    let redirect_url = setting.auth.redirect_url.as_ref().clone().unwrap();
    let redirect_url = format!("{}?token={}", redirect_url, res.token);
    let redirect_url = redirect_url.parse::<poem::http::Uri>().unwrap();
    Ok(poem::web::Redirect::moved_permanent(redirect_url))
}
