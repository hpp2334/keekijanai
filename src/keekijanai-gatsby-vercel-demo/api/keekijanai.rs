use http::StatusCode;
use keekijanai_serve_vercel_adapter::process;
use std::error::Error;
use vercel_lambda::{error::VercelError, lambda, IntoResponse, Request, Response};

fn handler(req: Request) -> Result<impl IntoResponse, VercelError> {
    process(req)
}

// Start the runtime with the handler
fn main() -> Result<(), Box<dyn Error>> {
    Ok(lambda!(handler))
}
