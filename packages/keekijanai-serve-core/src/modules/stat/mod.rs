pub mod controller;
mod middleware;
pub mod model;
mod service;

pub(crate) use middleware::uuid::UuidMiddleware;
