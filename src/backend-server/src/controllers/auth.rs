use backend::{modules::auth::oauth2::core::OAuth2Service, AUTH_SERVICE};
use hyper::{Body, Request, Response};
use routerify::{Router, ext::RequestExt};




async fn outh2_login_url(req: Request<Body>) -> Result<Response<Body>, anyhow::Error> {
    let provider =  req.param("provider").unwrap();
    let url = AUTH_SERVICE.oauth2_mgr.get(provider)?.get_auth_url();
    return Ok(Response::new(Body::from(url)));
}

async fn outh2_login(req: Request<Body>) -> Result<Response<Body>, anyhow::Error> {
    println!("in oauth2 login");
    let provider =  req.param("provider").unwrap();
    let query_string = req.uri().query().unwrap_or("");
    let query = qstring::QString::from(query_string);
    let code = query.get("code").unwrap();

    AUTH_SERVICE.login_oauth2(provider.as_str(), code).await?;
    println!("oauth2_login end");
    return Ok(Response::new(Body::from("ok")));
}

pub fn route() -> Router<Body, anyhow::Error> {
    Router::builder()
        .get("/oauth2/:provider", outh2_login_url)
        .get("/oauth2/:provider/callback",outh2_login)
        .build()
        .unwrap()
}
