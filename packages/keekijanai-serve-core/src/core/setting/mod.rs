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

#[derive(Debug, Deserialize)]
pub struct EnvSetting {
    pub database: String,
    pub auth_secret: String,
    pub github_id: Option<String>,
    pub github_secret: Option<String>,
    pub redirect: Option<String>,
}

pub static SETTING: OnceCell<Setting> = OnceCell::new();

impl Setting {
    pub fn init() {
        let setting = Self::new().unwrap();
        SETTING.set(setting).unwrap();
    }

    fn try_from_conf_file() -> Result<Self, anyhow::Error> {
        let mut config = config::Config::default();
        config.merge(config::File::with_name("keekijanai_config"))?;
        let setting: Setting = config.try_into()?;
        Ok(setting)
    }

    fn try_from_env() -> Result<Self, anyhow::Error> {
        let mut config = config::Config::default();
        config.merge(config::Environment::with_prefix("KKJN"))?;

        let setting: EnvSetting = config.try_into()?;
        let setting: Setting = Setting {
            auth: Auth {
                secret: setting.auth_secret,
                redirect_url: setting.redirect,
                github: if setting.github_id.is_none() {
                    None
                } else {
                    Some(Github {
                        client_id: setting.github_id.unwrap(),
                        client_secret: setting.github_secret.unwrap(),
                    })
                },
            },
            database: Database {
                url: setting.database,
            },
        };
        Ok(setting)
    }

    fn new() -> Result<Self, anyhow::Error> {
        let setting = Setting::try_from_conf_file();
        if setting.is_ok() {
            return setting;
        }
        let err = setting.unwrap_err();
        tracing::debug!("try from config file error: {}", err);
        let setting = Setting::try_from_env();
        if setting.is_ok() {
            return setting;
        }
        let err = setting.unwrap_err();
        tracing::debug!("try from env error: {}", err);
        anyhow::bail!("No config found in config file and env");
    }
}
