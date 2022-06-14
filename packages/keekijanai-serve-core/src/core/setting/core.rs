use serde::Deserialize;

#[derive(Debug)]
pub enum Environment {
    Development,
    Testing,
    Production,
}

#[derive(Debug, Deserialize)]
pub struct Github {
    pub client_id: String,
    pub client_secret: String,
}

#[derive(Debug, Deserialize)]
pub struct Auth {
    pub secret: String,
    pub redirect_url: Option<String>,
    pub github: Option<Github>,
}

#[derive(Debug, Deserialize)]
pub struct Database {
    pub url: String,
}

#[derive(Debug)]
pub struct AdminUser {
    provider: String,
    in_provider_id: String,
}

#[derive(Debug, Default)]
pub struct AdminUsers(pub Vec<AdminUser>);

#[derive(Debug, Default)]
pub struct Admin {
    /// Vec<scope1:username1>
    pub users: AdminUsers,
}

#[cfg(feature = "telegram")]
#[derive(Debug)]
pub struct NotificationTelegram {
    pub token: String,
    pub chat_id: i64,
}

#[derive(Debug, Default)]
pub struct Notification {
    #[cfg(feature = "telegram")]
    pub telegram: Option<NotificationTelegram>,
}

#[derive(Debug)]
pub struct Setting {
    pub environment: Environment,
    pub auth: Auth,
    pub database: Database,
    pub admin: Admin,
    pub notification: Notification,
}

impl Environment {
    pub fn parse(env_str: Option<&str>) -> anyhow::Result<Self> {
        if env_str.is_none() {
            return Ok(Environment::Production);
        }
        let env_str = env_str.unwrap();
        match env_str {
            "development" | "dev" => Ok(Environment::Development),
            "testing" | "test" => Ok(Environment::Testing),
            "production" | "prod" => Ok(Environment::Production),
            _ => Err(anyhow::anyhow!(
                "cannot find match environment for \"{}\"",
                env_str
            )),
        }
    }
}

impl AdminUser {
    pub fn parse(short_str: &str) -> anyhow::Result<Self> {
        let short_str = short_str.to_string();
        let strs = short_str.split(':').collect::<Vec<_>>();

        if strs.len() != 2 {
            anyhow::bail!("cannot find pattern \":\" in string \"{}\"", short_str);
        }
        let provider = strs[0];
        let in_provider_id = strs[1];

        if provider.is_empty() {
            anyhow::bail!("provider is empty");
        }
        if in_provider_id.is_empty() {
            anyhow::bail!("in_provider_id is empty");
        }

        Ok(Self {
            provider: provider.to_string(),
            in_provider_id: in_provider_id.to_string(),
        })
    }
}
