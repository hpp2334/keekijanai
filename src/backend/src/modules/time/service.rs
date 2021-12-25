use std::time::Duration;

use crate::core::Service;

pub struct TimeService;

impl Service for TimeService {
    fn serve() -> Self {
        Self {  }
    }

    fn init() {

    }
}

impl TimeService {
    pub async fn now(&self) -> anyhow::Result<Duration> {
        let time = std::time::SystemTime::now();
        let timestamp = time
            .duration_since(std::time::SystemTime::UNIX_EPOCH)
            .map_err(|e| anyhow::anyhow!("{}", e.to_string()))?;
        Ok(timestamp)
    }
}
