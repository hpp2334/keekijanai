pub mod core;
mod github;

use self::core::OAuth2Service;
use crate::modules::auth::oauth2::core::OAuth2Config;
use github::Github;

use std::{env};

lazy_static! {
    static ref GITHUB: Github = {
        return Github::new(OAuth2Config {
            client_id: env::var("GITHUB_CLIENT_ID").expect("GITHUB_CLIENT_ID not in var"),
            client_secret: env::var("GITHUB_CLIENT_SECRET")
                .expect("GITHUB_CLIENT_SECRET not in var"),
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
