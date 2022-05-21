use crate::{
    core::{setting::SETTING, ServeResult, Service},
    modules::{
        time::service::TimeService,
        user::{
            model::{User, UserActiveModel, UserRole},
            service::UserService,
        },
    },
};

use jsonwebtoken::TokenData;

use serde::{Deserialize, Serialize};

use super::oauth2::{core::OAuth2Service, OAuth2Manager};

#[derive(Debug, Deserialize, Serialize)]
pub struct Claims {
    pub exp: usize,
    pub user_id: i64,
}

#[derive(Debug)]
pub struct LegacyLogin {
    pub token: String,
    pub user: User,
}

pub struct LoginOauth2RespPayload {
    pub token: String,
    pub user: User,
}

pub struct AuthService {
    pub oauth2_mgr: OAuth2Manager,
}

impl Service for AuthService {
    fn serve() -> Self {
        Self {
            oauth2_mgr: OAuth2Manager::new(),
        }
    }

    fn init() {}
}

impl AuthService {
    pub async fn login_oauth2(
        &self,
        service: &str,
        code: &str,
    ) -> ServeResult<LoginOauth2RespPayload> {
        let oauth2 = self.oauth2_mgr.get(service)?;
        tracing::debug!("got prepare oauth2 service {}", service);

        let access_token = oauth2.get_access_token(code).await?;
        tracing::debug!("got access_token {}, (code = {})", access_token, code);

        let user_profile = oauth2.get_user_profile(access_token.as_str()).await?;
        tracing::debug!("got user profile (access_token = {})", access_token);

        let user = UserService::serve()
            .get_by_provider(service, user_profile.id.to_string().as_str())
            .await?;
        let time = TimeService::serve().now().await?.as_millis();
        let id = user.as_ref().map(|u| u.id);
        let mut user_active_model: UserActiveModel = if user.is_none() {
            let model: UserActiveModel = UserActiveModel {
                in_provider_id: user_profile.id.to_string().into(),
                email: user_profile.email.into(),
                name: user_profile.name.into(),
                provider: service.to_owned().into(),
                role: (UserRole::Public as i32).into(),
                last_login: (time as i64).into(),
                ..Default::default()
            };
            model
        } else {
            user.unwrap().into()
        };

        let user_profile = oauth2.get_user_profile(access_token.as_str()).await?;
        user_active_model.avatar_url = user_profile.avatar_url.into();
        user_active_model.email = user_profile.email.into();

        let user = UserService::serve().upsert(id, user_active_model).await?;
        let token = self.encode_to_token(user.id).await?;

        let res = LoginOauth2RespPayload { token, user };
        return Ok(res);
    }

    pub fn decode_token(&self, token: String) -> ServeResult<TokenData<Claims>> {
        let secret = &SETTING.get().unwrap().auth.secret;
        let token = jsonwebtoken::decode::<Claims>(
            &token,
            &jsonwebtoken::DecodingKey::from_secret(secret.as_bytes()),
            &jsonwebtoken::Validation::default(),
        )
        .map_err(|_e| crate::modules::auth::error::ExpiredToken)?;
        Ok(token)
    }

    pub async fn encode_to_token(&self, user_id: i64) -> ServeResult<String> {
        let time_service = TimeService::serve();
        let secret = &SETTING.get().unwrap().auth.secret;
        let claims = Claims {
            exp: (time_service.now().await?.as_secs() as usize) + 86400,
            user_id,
        };
        let token = jsonwebtoken::encode(
            &jsonwebtoken::Header::default(),
            &claims,
            &jsonwebtoken::EncodingKey::from_secret(secret.as_bytes()),
        )?;
        Ok(token)
    }
}
