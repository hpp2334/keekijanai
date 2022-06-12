use serde::Deserialize;

pub use super::core::{Admin, AdminUser, AdminUsers, Auth, Database, Environment, Setting};

#[derive(Debug, Deserialize)]
pub struct DeclarativeAdminUser(String);

#[derive(Debug, Deserialize)]
pub struct DeclarativeAdminUsers(Vec<DeclarativeAdminUser>);

#[derive(Debug, Deserialize)]
pub struct DeclarativeAdmin {
    /// Vec<scope1:username1>
    pub users: DeclarativeAdminUsers,
}

#[derive(Debug, Deserialize)]
pub struct DeclarativeSetting {
    pub environment: Option<&'static str>,
    pub auth: Auth,
    pub database: Database,
    pub admin: Option<DeclarativeAdmin>,
}

impl TryInto<AdminUser> for DeclarativeAdminUser {
    type Error = anyhow::Error;
    fn try_into(self) -> Result<AdminUser, Self::Error> {
        AdminUser::parse(&self.0)
    }
}

impl TryInto<Admin> for DeclarativeAdmin {
    type Error = anyhow::Error;

    fn try_into(self) -> Result<Admin, Self::Error> {
        let users = self
            .users
            .0
            .into_iter()
            .map(|user| user.try_into())
            .collect::<anyhow::Result<Vec<AdminUser>>>()?;
        let users = AdminUsers(users);

        Ok(Admin { users })
    }
}

impl TryInto<Setting> for DeclarativeSetting {
    type Error = anyhow::Error;

    fn try_into(self) -> Result<Setting, Self::Error> {
        let environment = Environment::parse(self.environment)?;
        let admin = if let Some(admin) = self.admin {
            admin.try_into()?
        } else {
            Admin::default()
        };

        Ok(Setting {
            environment,
            admin,
            auth: self.auth,
            database: self.database,
        })
    }
}
