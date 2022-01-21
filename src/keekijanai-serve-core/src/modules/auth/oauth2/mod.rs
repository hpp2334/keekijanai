pub mod core;
mod github;

use self::core::OAuth2Service;
use crate::{core::setting::SETTING, modules::auth::oauth2::core::OAuth2Config};
use github::Github;

use std::env;

lazy_static! {
    static ref GITHUB: Github = {
        let setting = SETTING.get().unwrap();
        let setting_github = setting.auth.github.as_ref().unwrap();
        return Github::new(OAuth2Config {
            client_id: setting_github.client_id.clone(),
            client_secret: setting_github.client_secret.clone(),
        });
    };
}

pub struct OAuth2Manager {}

impl OAuth2Manager {
    pub fn new() -> OAuth2Manager {
        return OAuth2Manager {};
    }

    pub fn get(&self, service: &str) -> anyhow::Result<impl OAuth2Service> {
        match service {
            "github" => Ok(Github::new(OAuth2Config {
                client_id: env::var("GITHUB_CLIENT_ID").expect("GITHUB_CLIENT_ID not in var"),
                client_secret: env::var("GITHUB_CLIENT_SECRET")
                    .expect("GITHUB_CLIENT_SECRET not in var"),
            })),
            _ => Err(anyhow::anyhow!("unsupport service")),
        }
    }
}
