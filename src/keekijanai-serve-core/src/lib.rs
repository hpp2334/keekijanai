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

pub use modules::get_keekijanai_route;

pub async fn init() {
    crate::core::setting::Setting::init();

    crate::core::db::init_pool().await.unwrap();
}
