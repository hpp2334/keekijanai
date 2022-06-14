use std::sync::Arc;

use crate::core::di::{DIComponent, DIContainer};
use crate::modules::auth::UserInfo;
use crate::modules::notification::enforcer_manager::{register_enforcers, EnforcerManager};
use crate::modules::notification::enforcers::NotificationPayload;
use crate::modules::time::service::TimeService;
use crate::modules::user::model::User;

use super::enforcer_manager;

pub struct NotificationService {
    time_service: TimeService,
    enforcer_manager: Arc<EnforcerManager>,
}

impl DIComponent for NotificationService {
    fn build(container: &DIContainer) -> Self {
        let mut enforcer_manager = container.resolve::<EnforcerManager>();
        register_enforcers(&mut enforcer_manager).unwrap();

        let time_service = container.resolve::<TimeService>();

        Self {
            enforcer_manager: Arc::new(enforcer_manager),
            time_service,
        }
    }
}

impl NotificationService {
    pub fn notify<THEME, CONTENT>(&self, user_info: &UserInfo, theme: THEME, content: CONTENT) -> ()
    where
        THEME: Into<String>,
        CONTENT: Into<String>,
    {
        let payload = NotificationPayload {
            theme: theme.into(),
            content: content.into(),
            user: User::clone(user_info),
            time: self.time_service.now(),
        };

        let enforcer_manager = self.enforcer_manager.clone();
        tokio::spawn(async move {
            enforcer_manager.notify(payload).await;
        });
    }
}
