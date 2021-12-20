#![feature(trace_macros)]

use serve_resp_err_macro::{KeekijanaiRespErr};


#[derive(KeekijanaiRespErr)]
#[resp_err ="AUTH ERROR"]

struct AuthError(String, String);

#[derive(KeekijanaiRespErr)]
#[resp_err = "NOT LOGIN"]
struct NotLoginError;

fn main() {

}
