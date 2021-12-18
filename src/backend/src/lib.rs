extern crate dotenv;

#[macro_use]
extern crate lazy_static;

#[macro_use]
extern crate num_derive;

#[macro_use]
mod core;
mod helpers;

pub use backend_router::{RouterService};

pub mod modules;

pub use modules::{controller::get_router};