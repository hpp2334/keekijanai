use crate::core::{di::DIComponent, ServeResult};
use crate::modules::notification::enforcers::{NotificationPayload, TelegramNotification};

use super::enforcers::{self, NotificationBase};

pub(crate) struct EnforcerManager {
    enforcers: Vec<Box<dyn NotificationBase + Send + Sync>>,
}

impl DIComponent for EnforcerManager {
    fn build(_container: &crate::core::di::DIContainer) -> Self {
        Self { enforcers: vec![] }
    }
}

impl EnforcerManager {
    pub fn register<T: NotificationBase + Send + Sync + 'static>(&mut self) -> ServeResult<()> {
        let enforcer = T::build()?;
        self.enforcers.push(Box::new(enforcer));

        Ok(())
    }

    pub async fn notify(&self, payload: NotificationPayload) -> () {
        for enforcer in self.enforcers.iter() {
            if !enforcer.enable() {
                continue;
            }
            let res = enforcer.notify(payload.clone()).await;
            if let Err(e) = res {
                tracing::error!("{}", e);
            }
        }
    }
}

pub(crate) fn register_enforcers(manager: &mut EnforcerManager) -> ServeResult<()> {
    manager.register::<TelegramNotification>()?;

    Ok(())
}
