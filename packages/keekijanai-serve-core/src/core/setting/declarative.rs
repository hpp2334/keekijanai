use serde::Deserialize;

pub use super::core::{Admin, AdminUser, AdminUsers, Auth, Database, Environment, Setting};
use super::core::{Notification, NotificationTelegram};

#[derive(Debug, Deserialize)]
pub struct DeclarativeAdminUser(String);

#[derive(Debug, Deserialize)]
pub struct DeclarativeAdminUsers(Vec<DeclarativeAdminUser>);

#[derive(Debug, Deserialize)]
pub struct DeclarativeAdmin {
    /// Vec<scope1:username1>
    pub users: DeclarativeAdminUsers,
}

#[cfg(feature = "telegram")]
#[derive(Debug, Deserialize)]
pub struct DeclarativeNotificationTelegram {
    token: String,
    chat_id: i64,
}

#[derive(Debug, Deserialize)]
pub struct DeclarativeNotification {
    #[cfg(feature = "telegram")]
    pub telegram: Option<DeclarativeNotificationTelegram>,
}

#[derive(Debug, Deserialize)]
pub struct DeclarativeSetting {
    pub environment: Option<&'static str>,
    pub auth: Auth,
    pub database: Database,
    pub admin: Option<DeclarativeAdmin>,
    pub notification: Option<DeclarativeNotification>,
}

#[cfg(feature = "telegram")]
impl TryInto<NotificationTelegram> for DeclarativeNotificationTelegram {
    type Error = anyhow::Error;

    fn try_into(self) -> Result<NotificationTelegram, Self::Error> {
        let res = NotificationTelegram {
            token: self.token,
            chat_id: self.chat_id,
        };
        Ok(res)
    }
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

impl TryInto<Notification> for DeclarativeNotification {
    type Error = anyhow::Error;

    fn try_into(self) -> Result<Notification, Self::Error> {
        #[cfg(feature = "telegram")]
        let telegram = self.telegram.map(TryInto::try_into).transpose()?;

        Ok(Notification {
            #[cfg(feature = "telegram")]
            telegram,
        })
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

        let notification = if let Some(notification) = self.notification {
            notification.try_into()?
        } else {
            Notification::default()
        };

        Ok(Setting {
            environment,
            admin,
            auth: self.auth,
            database: self.database,
            notification,
        })
    }
}
