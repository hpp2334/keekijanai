use std::time::SystemTime;

use async_trait::async_trait;

use crate::{core::ServeResult, modules::user::model::User};

#[derive(Debug, Clone)]
pub struct NotificationPayload {
    pub theme: String,
    pub content: String,
    pub user: User,
    pub time: SystemTime,
}

#[async_trait]
pub(crate) trait NotificationBase {
    fn build() -> ServeResult<Self>
    where
        Self: Sized;
    fn enable(&self) -> bool;
    async fn notify(&self, payload: NotificationPayload) -> ServeResult<()>;
}
