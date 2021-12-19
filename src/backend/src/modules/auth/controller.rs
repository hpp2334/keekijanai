use poem_openapi::{OpenApi, param, payload::Json, payload::PlainText};
use serde::Deserialize;

use crate::core::{Service, ApiTags};

use super::{service::AuthService, oauth2::core::OAuth2Service};


#[derive(Deserialize)]
struct OAuth2LoginQuery {
    code: String,
}

pub struct AuthController;

#[OpenApi(prefix_path = "/keekijanai/auth", tag = "ApiTags::Auth")]
impl AuthController {
    #[oai(path = "/:provider", method = "get")]
    async fn outh2_login_url(&self, provider: param::Path<String>) -> poem::Result<PlainText<String>> {
        let provider = (*provider).clone();
        let url = AuthService::serve().oauth2_mgr.get(provider.as_str())?.get_auth_url();

        Ok(PlainText(url))
    }

    #[oai(path = "/:provider/callback", method = "get")]
    async fn outh2_login(&self, provider: param::Path<String>, code: param::Query<String>) -> poem::Result<PlainText<&'static str>> {
        let provider = (*provider).clone();
        let code = (*code).clone();
    
        AuthService::serve().login_oauth2(provider.as_str(), &code).await?;
        println!("oauth2_login end");
        Ok(PlainText(""))
    }
}
