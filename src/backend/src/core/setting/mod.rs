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

    pub github: Option<Github>,
}

#[derive(Debug, Deserialize)]
pub struct Setting {
    pub auth: Auth,
}

pub static SETTING: OnceCell<Setting> = OnceCell::new();

impl Setting {
    pub fn new() -> Result<Self, anyhow::Error> {
        let mut config = config::Config::default();

        config.merge(config::File::with_name("config"))?;

        let setting: Setting = config.try_into()?;
        Ok(setting)
    }
}
