pub mod core;
mod github;

use self::core::OAuth2Service;
use crate::{core::setting::SETTING, modules::auth::oauth2::core::OAuth2Config};
use github::Github;

pub struct OAuth2Manager {}

impl OAuth2Manager {
    pub fn new() -> OAuth2Manager {
        return OAuth2Manager {};
    }

    pub fn get(&self, service: &str) -> anyhow::Result<impl OAuth2Service> {
        let setting = SETTING.get().unwrap();
        match service {
            "github" => {
                let setting_github = setting.auth.github.as_ref().unwrap();

                Ok(Github::new(OAuth2Config {
                    client_id: setting_github.client_id.clone(),
                    client_secret: setting_github.client_secret.clone(),
                }))
            }
            _ => Err(anyhow::anyhow!("unsupport service")),
        }
    }
}
