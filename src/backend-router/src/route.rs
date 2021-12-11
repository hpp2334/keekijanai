use std::{future::Future, collections::HashMap};


pub use hyper::{Body, Response};
use regex::Regex;

use crate::{request::Request, method::Method};


type Handler<R, E> = Box<dyn Fn(Request) -> HandlerMut<R, E> + Send + Sync + 'static>;
type HandlerMut<R, E> = Box<dyn Future<Output = Result<Response<R>, E>> + Send + 'static>;

pub struct Route<R, E> {
    pub pattern: String,
    pub pattern_re: Regex,
    pub method: Method,
    pub handler: Handler<R, E>,
    pub(crate) params_name: Vec<String>,
}
