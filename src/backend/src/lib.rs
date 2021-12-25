extern crate proc_macro;
extern crate dotenv;

#[macro_use]
extern crate lazy_static;

#[macro_use]
extern crate num_derive;

#[macro_use]
mod core;
mod helpers;

pub mod modules;

pub use modules::{controller::get_keekijanai_route};

pub fn init() {
    crate::core::setting::Setting::init();
}
