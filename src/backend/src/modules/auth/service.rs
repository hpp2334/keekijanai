use crate::{
    core::{setting::SETTING, Service},
    modules::{
        time::service::TimeService,
        user::{
            model::{User, UserActiveModel},
            service::UserService,
        },
    },
};
use argon2::{self};
use jsonwebtoken::TokenData;
use poem_openapi::Object;
use serde::{Deserialize, Serialize};

use super::oauth2::{core::OAuth2Service, OAuth2Manager};

use super::error as auth_error;

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
    pub async fn login_oauth2(&self, service: &str, code: &str) -> anyhow::Result<()> {
        let oauth2 = self.oauth2_mgr.get(service)?;
        let access_token = oauth2.get_access_token(code).await?;
        let user_profile = oauth2.get_user_profile(access_token.as_str()).await?;

        let user = UserService::serve()
            .get_by_provider(service, user_profile.id.to_string().as_str())
            .await?;
        let id = user.as_ref().map(|u| u.id);
        let user_active_model: UserActiveModel = if user.is_none() {
            let model: UserActiveModel = UserActiveModel {
                in_provider_id: user_profile.id.to_string().into(),
                email: user_profile.email.into(),
                name: user_profile.name.into(),
                provider: service.to_owned().into(),
                ..Default::default()
            };
            model
        } else {
            user.unwrap().into()
        };
        let resp = UserService::serve().upsert(id, user_active_model).await?;
        return Ok(resp);
    }

    pub async fn legacy_login(&self, username: &str, password: &str) -> anyhow::Result<LegacyLogin> {
        let user_service = UserService::serve();
        let user = user_service.get_by_provider("self", username).await?;
        if user.is_none() {
            return Err(auth_error::UserNotFound(format!(
                "provider = self, in_provider_id = {}",
                username
            )))?;
        }
        let user = user.unwrap();
        let hashed_password = if user.password.is_some() {
            user.password.clone().unwrap()
        } else {
            return Err(anyhow::anyhow!(
                "password not set, it may be a bug (user_id = {})",
                user.id
            ))?;
        };
        let is_password_match = self.verify_hash(hashed_password.as_str(), password)?;
        if !is_password_match {
            return Err(auth_error::PasswordNotMatch(format!(
                "provider = self, in_provider_id = {}",
                username
            )))?;
        }

        let token = self.encode_to_token(user.id).await?;

        let time = TimeService::serve().now().await?.as_millis();
        let mut to_update = UserActiveModel::default();
        to_update.last_login.set(time as i64);
        let _update_res = user_service.upsert(Some(user.id), to_update).await?;

        let res = LegacyLogin {
            token,
            user,
        };

        return Ok(res);
    }

    pub async fn legacy_register(&self, username: &str, password: &str) -> anyhow::Result<()> {
        let user_service = UserService::serve();

        if user_service
            .get_by_provider("self", username)
            .await?
            .is_some()
        {
            return Err(auth_error::UserExists(username.to_owned()))?;
        }
        let hash = self.to_hash(password)?;
        let mut to_create = UserActiveModel::default();
        to_create.provider.set("self".to_owned());
        to_create.name.set(username.to_owned());
        to_create.in_provider_id.set(username.to_owned());
        to_create.password.set(hash);
        let _inserted = user_service.upsert(None, to_create).await?;

        Ok(())
    }

    pub fn decode_token(&self, token: String) -> anyhow::Result<TokenData<Claims>> {
        let secret = &SETTING.get().unwrap().auth.secret;
        let token = jsonwebtoken::decode::<Claims>(
            &token,
            &jsonwebtoken::DecodingKey::from_secret(secret.as_bytes()),
            &jsonwebtoken::Validation::default(),
        )
        .map_err(|_e| crate::modules::auth::error::ExpiredToken)?;
        Ok(token)
    }

    pub async fn encode_to_token(&self, user_id: i64) -> anyhow::Result<String> {
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

    fn to_hash(&self, password: &str) -> anyhow::Result<String> {
        let setting = SETTING.get().unwrap();
        let password = password.as_bytes();
        let salt = setting.auth.legacy_auth_salt.as_bytes();
        let config = argon2::Config::default();
        let hash = argon2::hash_encoded(password, salt, &config)?;
        Ok(hash)
    }

    fn verify_hash(&self, hash: &str, password: &str) -> anyhow::Result<bool> {
        let matches = argon2::verify_encoded(hash, password.as_bytes()).unwrap();
        Ok(matches)
    }
}
