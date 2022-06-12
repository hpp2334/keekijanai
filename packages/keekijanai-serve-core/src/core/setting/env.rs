use serde::Deserialize;

use super::core::Github;
pub use super::core::{Admin, AdminUser, AdminUsers, Auth, Database, Environment, Setting};

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

        Ok(Setting {
            auth,
            admin,
            environment,
            database,
        })
    }
}
