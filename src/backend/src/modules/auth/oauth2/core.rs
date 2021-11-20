use derive_more::Display;
use serde::{Serialize, Deserialize};
use async_trait::async_trait;

pub struct OAuth2Config {
    pub client_id: String,
    pub client_secret: String,
}

#[derive(Serialize, Deserialize, Debug)]
pub struct UserProfile {
    pub avatar_url: Option<String>,
    pub id: i64,
    pub name: String,
    pub email: Option<String>
}

#[async_trait]
pub trait OAuth2Service {
    fn get_auth_url(&self) -> String;
    async fn get_access_token(&self, code: &str) -> anyhow::Result<String>;
    async fn get_user_profile(&self, access_token: &str) -> anyhow::Result<UserProfile>;
}