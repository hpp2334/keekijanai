use std::time::Duration;

use crate::core::{di::DIComponent, ServeResult, Service};

#[derive(Debug)]
pub struct TimeService;

impl DIComponent for TimeService {
    fn build(container: &crate::core::di::DIContainer) -> Self {
        Self {}
    }
}

impl TimeService {
    pub async fn now(&self) -> ServeResult<Duration> {
        let time = std::time::SystemTime::now();
        let timestamp = time
            .duration_since(std::time::SystemTime::UNIX_EPOCH)
            .map_err(anyhow::Error::from)?;
        Ok(timestamp)
    }
}
