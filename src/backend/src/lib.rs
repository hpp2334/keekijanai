extern crate dotenv;

#[macro_use]
extern crate lazy_static;


#[macro_use]
mod core;

pub mod modules;

use modules::{auth::service::AuthService, user::service::UserService};

lazy_static! {
    pub static ref USER_SERVICE: UserService = {
        return UserService::new();
    };
    pub static ref AUTH_SERVICE: AuthService<'static> = {
        return AuthService::new(&USER_SERVICE);
    };
}