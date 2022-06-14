mod core;
mod declarative;
mod env;

use once_cell::sync::OnceCell;

pub use self::core::Setting;
use self::{declarative::DeclarativeSetting, env::EnvSetting};

pub static SETTING: OnceCell<Setting> = OnceCell::new();

fn try_from_conf_file() -> Result<Setting, anyhow::Error> {
    let mut config = config::Config::default();
    config.merge(config::File::with_name("keekijanai_config"))?;
    let setting: DeclarativeSetting = config.try_into()?;
    let setting = setting.try_into()?;
    Ok(setting)
}

fn try_from_env() -> Result<Setting, anyhow::Error> {
    let mut config = config::Config::default();
    config.merge(config::Environment::with_prefix("KKJN"))?;

    let setting: EnvSetting = config.try_into()?;
    let setting: Setting = setting.try_into()?;
    Ok(setting)
}

fn build_setting() -> Result<Setting, anyhow::Error> {
    let setting = try_from_conf_file();
    if setting.is_ok() {
        return setting;
    }
    let err = setting.unwrap_err();
    tracing::debug!("try from config file error: {}", err);
    let setting = try_from_env();
    if setting.is_ok() {
        return setting;
    }
    let err = setting.unwrap_err();
    tracing::debug!("try from env error: {}", err);
    anyhow::bail!("No config found in config file and env");
}

pub fn get_setting() -> anyhow::Result<&'static Setting> {
    SETTING.get().ok_or(anyhow::anyhow!("setting not set"))
}

pub fn init_setting() -> anyhow::Result<()> {
    let setting = build_setting()?;
    SETTING
        .set(setting)
        .map_err(|e| anyhow::anyhow!("set setting OnceCell fail: {:?}", e))?;

    Ok(())
}
