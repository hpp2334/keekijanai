use once_cell::sync::OnceCell;
use serde::Deserialize;

#[derive(Debug, Deserialize)]
pub struct Github {
    pub client_id: String,
    pub client_secret: String,
}

#[derive(Debug, Deserialize)]
pub struct Auth {
    pub secret: String,
    pub legacy_auth_salt: String,
    pub redirect_url: Option<String>,

    pub github: Option<Github>,
}

#[derive(Debug, Deserialize)]
pub struct Database {
    pub url: String,
}

#[derive(Debug, Deserialize)]
pub struct Setting {
    pub auth: Auth,
    pub database: Database,
}

pub static SETTING: OnceCell<Setting> = OnceCell::new();

impl Setting {
    pub fn init() {
        let setting = Self::new().unwrap();
        SETTING.set(setting).unwrap();
    }

    fn new() -> Result<Self, anyhow::Error> {
        let mut config = config::Config::default();

        config.merge(config::File::with_name("keekijanai_config"))?;

        let setting: Setting = config.try_into()?;
        Ok(setting)
    }
}