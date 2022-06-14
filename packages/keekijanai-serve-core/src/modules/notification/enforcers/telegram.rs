use crate::core::{setting::get_setting, ServeResult};

use super::{NotificationBase, NotificationPayload};
use async_trait::async_trait;
use teloxide::prelude::*;

#[derive(Debug, Clone)]
struct TelegramData {
    pub token: String,
    pub chat_id: i64,
}

pub struct TelegramNotification {
    data: Option<TelegramData>,
}

#[async_trait]
impl NotificationBase for TelegramNotification {
    fn build() -> ServeResult<Self> {
        let setting = get_setting()?;
        let data = setting
            .notification
            .telegram
            .as_ref()
            .map(|data| TelegramData {
                token: data.token.clone(),
                chat_id: data.chat_id.clone(),
            });
        Ok(Self { data })
    }
    fn enable(&self) -> bool {
        let valid = self.data.is_some();
        valid
    }

    async fn notify(&self, payload: NotificationPayload) -> ServeResult<()> {
        let data = self.data.as_ref().unwrap();
        let bot = Bot::new(&data.token);

        let text = {
            let user_text = if payload.user.is_anonymous() {
                format!("{}:{}", payload.user.provider, payload.user.in_provider_id)
            } else {
                format!("anonymous ({})", payload.user.id)
            };

            let time: chrono::DateTime<chrono::Utc> = payload.time.into();
            let formatted_time = time.format("%Y-%m-%d %H:%M:%S").to_string();
            format!(
                r#"
[user] {}
[theme] {}
[content] {}
[time] {}"#,
                user_text, payload.theme, payload.content, formatted_time
            )
            .trim()
            .to_string()
        };

        bot.send_message(ChatId(data.chat_id), text).send().await?;

        Ok(())
    }
}
