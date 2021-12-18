use std::env;
use async_trait::async_trait;
use reqwest::{Method, Client};
use serde::{Deserialize};


use super::core::{OAuth2Config, OAuth2Service, UserProfile};

const AUTH_URL: &'static str = "https://github.com/login/oauth/authorize";
const TOKEN_URL: &'static str = "https://github.com/login/oauth/access_token";

#[derive(Deserialize)]
struct GithubUserProfile {
    pub avatar_url: Option<String>,
    pub id: i64,
    pub login: String,
    pub email: Option<String>
}
pub struct Github {
    config: OAuth2Config,
}

impl Github {
    pub fn new(config: OAuth2Config) -> Self {
        Github { config }
    }
}

fn build_client() -> anyhow::Result<Client> {
    let proxy = env::var("PROXY");
    let client = if proxy.is_err() {
        reqwest::Client::new()
    } else {
        let proxy = proxy.unwrap();
        reqwest::Client::builder()
            .proxy(reqwest::Proxy::http(proxy.as_str())?)
            .proxy(reqwest::Proxy::https(proxy.as_str())?)
            .build()?
    };
    return Ok(client)
}

#[async_trait]
impl OAuth2Service for Github {
    fn get_auth_url(&self) -> String {
        return format!("{}?client_id={}", AUTH_URL, self.config.client_id);
    }

    async fn get_access_token(&self, code: &str) -> anyhow::Result<String> {
        log::debug!("[get_access_token] code is {}", code);
        let client = build_client()?;
        let resp = client
            .request(Method::POST, TOKEN_URL)
            .query(&[
                ("client_id", &self.config.client_id),
                ("client_secret", &self.config.client_secret),
                ("code", &code.to_string()),
            ])
            .send()
            .await?
            .text()
            .await?;
        log::debug!("get_access_token {}", resp);

        let qs = qstring::QString::from(resp.as_str());
        log::debug!("parsed query {:?}", qs);

        if qs.has("error") {
            let error = qs.get("error_description");
            return Err(anyhow::anyhow!("error: {}", error.unwrap_or("unknown error")));
        }

        let access_token = qs.get("access_token");
        if access_token.is_none() {
            return Err(anyhow::anyhow!("access_token not found in query"));
        }
        let access_token = access_token.unwrap();
        return Ok(access_token.to_owned());
    }

    async fn get_user_profile(&self, access_token: &str) -> anyhow::Result<UserProfile> {
        log::debug!("use access_token {}", access_token);

        let client = build_client()?;
        let resp = client
            .request(Method::GET, "https://api.github.com/user")
            .header("User-Agent", "reqwest")
            .header("Authorization", std::format!("token {}", access_token))
            .header("Accept", "application/vnd.github.v3+json")
            .send()
            .await?;

        log::debug!("get_user_profile resp text: {:?}", &resp);

        if resp.status().is_client_error() || resp.status().is_server_error() {
            log::debug!("error status {:?}", resp.status());
            return Err(anyhow::anyhow!(resp.text().await?));
        }

        let user_profile = resp.json::<GithubUserProfile>().await?;

        let user_profile = UserProfile {
            id: user_profile.id,
            name: user_profile.login,
            avatar_url: user_profile.avatar_url,
            email: user_profile.email,
        };

        log::debug!("user_profile: {:?}", user_profile);

        return Ok(user_profile);
    }

    
}
