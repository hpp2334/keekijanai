extern crate dotenv;

#[macro_use]
extern crate lazy_static;


#[macro_use]
mod core;

pub use backend_router::{RouterService};

pub mod modules;

pub use modules::{controller::get_router};