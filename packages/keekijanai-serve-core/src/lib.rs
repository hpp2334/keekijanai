extern crate dotenv;
extern crate proc_macro;

#[macro_use]
extern crate lazy_static;

#[macro_use]
extern crate num_derive;

#[macro_use]
mod core;
mod helpers;

pub mod modules;

use once_cell::sync::Lazy;
pub use poem;

pub use modules::{get_keekijanai_endpoint, write_keekijanai_openapi_spec};
use tokio::sync::Mutex;

static INIT_MUTEX: Lazy<Mutex<bool>> = Lazy::new(|| Mutex::new(false));

pub async fn init() {
    let mut mutex = INIT_MUTEX.lock().await;
    if *mutex == true {
        return;
    }

    crate::core::setting::Setting::init();
    crate::core::db::init_pool().await.unwrap();
    *mutex = true;
}
