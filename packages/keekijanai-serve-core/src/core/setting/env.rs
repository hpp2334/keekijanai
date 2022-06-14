use serde::Deserialize;

use crate::modules::notification;

pub use super::core::{Admin, AdminUser, AdminUsers, Auth, Database, Environment, Setting};
use super::core::{Github, Notification, NotificationTelegram};

#[derive(Debug, Deserialize)]
pub struct EnvSetting {
    // provider1:in_provider_id1;provider2:in_provider_id2
    pub environment: Option<&'static str>,
    pub database: String,
    pub auth_secret: String,
    pub github_id: Option<String>,
    pub github_secret: Option<String>,
    pub redirect: Option<String>,
    pub admin_users: Option<EnvAdminUsers>,
    pub telegram_token: Option<String>,
    pub telegram_chat_id: Option<i64>,
}

#[derive(Debug, Deserialize)]
pub struct EnvAdminUsers(String);

impl TryInto<AdminUsers> for EnvAdminUsers {
    type Error = anyhow::Error;

    fn try_into(self) -> Result<AdminUsers, Self::Error> {
        let users = self
            .0
            .split(";")
            .map(|s| AdminUser::parse(s))
            .collect::<anyhow::Result<Vec<AdminUser>>>()?;

        let users = AdminUsers(users);

        Ok(users)
    }
}

impl TryInto<Setting> for EnvSetting {
    type Error = anyhow::Error;

    fn try_into(self) -> Result<Setting, Self::Error> {
        let auth = Auth {
            secret: self.auth_secret,
            redirect_url: self.redirect,
            github: if self.github_id.is_none() {
                None
            } else {
                Some(Github {
                    client_id: self.github_id.unwrap(),
                    client_secret: self.github_secret.unwrap(),
                })
            },
        };
        let database = Database { url: self.database };

        let admin_users = if let Some(users) = self.admin_users {
            users.try_into()?
        } else {
            AdminUsers::default()
        };
        let admin = Admin { users: admin_users };

        let environment = Environment::parse(self.environment)?;

        let mut notification = Notification::default();

        #[cfg(feature = "telegram")]
        if self.telegram_chat_id.is_some() || self.telegram_token.is_some() {
            let token = self
                .telegram_token
                .ok_or(anyhow::anyhow!("telegram_token is null"))?;
            let chat_id = self
                .telegram_chat_id
                .ok_or(anyhow::anyhow!("telegram_chat_id is null"))?;

            let telegram = NotificationTelegram { token, chat_id };
            notification.telegram = Some(telegram);
        }

        Ok(Setting {
            auth,
            admin,
            environment,
            database,
            notification,
        })
    }
}
