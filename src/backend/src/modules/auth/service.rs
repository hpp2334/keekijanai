use crate::{modules::user::{model::UserActiveModel, service::{UserService}}, core::Service};

use super::oauth2::{core::OAuth2Service, OAuth2Manager};

pub struct AuthService {
    pub oauth2_mgr: OAuth2Manager,
}

impl Service for AuthService {
    fn serve() -> Self {
        Self {
            oauth2_mgr: OAuth2Manager::new(),
        }
    }

    fn init() {

    }
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
}
