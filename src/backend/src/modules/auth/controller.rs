use backend_router::{Request, Response, Body, Router, Method};
use serde::Deserialize;

use super::{service::AUTH_SERVICE, oauth2::core::OAuth2Service};

#[derive(Deserialize)]
struct OAuth2LoginQuery {
    code: String,
}

async fn outh2_login_url(req: Request) -> anyhow::Result<Response<Body>> {
    let provider =  req.get_param("provider").unwrap();
    let url = AUTH_SERVICE.oauth2_mgr.get(provider)?.get_auth_url();
    return Ok(Response::new(Body::from(url)));
}

async fn outh2_login(req: Request) -> anyhow::Result<Response<Body>> {
    println!("in oauth2 login");
    let provider =  req.get_param("provider").unwrap();
    let query = req.parse_query::<OAuth2LoginQuery>().unwrap();

    AUTH_SERVICE.login_oauth2(provider.as_str(), &query.code).await?;
    println!("oauth2_login end");
    return Ok(Response::new("".into()));
}

pub fn get_router() -> Router<Body, anyhow::Error> {
    Router::builder()
        .add("/oauth2/:provider", Method::GET, outh2_login_url)
        .add("/oauth2/:provider/callback",Method::GET, outh2_login)
        .build()
}
