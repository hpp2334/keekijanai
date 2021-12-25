use poem::web;
use poem_openapi::{OpenApi, param, payload::{PlainText, Json}, Object};


use crate::{core::{Service, ApiTags}, modules::user::model::User};

use super::{service::AuthService, oauth2::core::OAuth2Service, UserInfo};

#[derive(Debug, Object)]
struct LoginParams {
    username: String,
    password: String,
}

#[derive(Debug, Object)]
struct LoginRespPayload {
    user: User,
    token: String,
}

#[derive(Debug, Object)]
struct RegisterParams {
    username: String,
    password: String,
}

pub struct AuthController;

#[OpenApi(prefix_path = "/keekijanai/auth", tag = "ApiTags::Auth")]
impl AuthController {
    #[oai(path = "/oauth2/:provider", method = "get")]
    async fn outh2_login_url(&self, provider: param::Path<String>) -> poem::Result<PlainText<String>> {
        let provider = (*provider).clone();
        let url = AuthService::serve().oauth2_mgr.get(provider.as_str())?.get_auth_url();

        Ok(PlainText(url))
    }

    #[oai(path = "/oauth2/:provider/callback", method = "get")]
    async fn outh2_login(&self, provider: param::Path<String>, code: param::Query<String>) -> poem::Result<PlainText<&'static str>> {
        let provider = (*provider).clone();
        let code = (*code).clone();
    
        AuthService::serve().login_oauth2(provider.as_str(), &code).await?;
        println!("oauth2_login end");
        Ok(PlainText(""))
    }

    #[oai(path = "/login", method = "post")]
    async fn legacy_login(&self, user_info: web::Data<&UserInfo>, params: Json<LoginParams>) -> poem::Result<Json<LoginRespPayload>> {
        if !user_info.is_anonymous() {
            return Err(super::error::HasLogin(user_info.id))?;
        }

        let auth_service = AuthService::serve();
        let auth_login_res = auth_service.legacy_login(params.username.as_str(), params.password.as_str()).await?;
        let resp = LoginRespPayload {
            user: auth_login_res.user,
            token: auth_login_res.token,
        };
        Ok(Json(resp))
    }

    #[oai(path = "/register", method = "post")]
    async fn legacy_register(&self, params: Json<RegisterParams>) -> poem::Result<PlainText<&'static str>> {
        let auth_service = AuthService::serve();

        let _res = auth_service.legacy_register(params.username.as_str(), params.password.as_str()).await?;
        Ok(PlainText(""))
    }
}
