use axum::{http::Request, middleware::Next, response::IntoResponse};
use tower_cookies::{Cookie, Cookies};

pub const UUID_COOKIE_NAME: &'static str = "_keekijanai_uuid";

#[derive(Debug, Clone)]
pub struct AttchedUuid(pub String);

pub async fn attch_uuid_middleware<B>(mut req: Request<B>, next: Next<B>) -> impl IntoResponse {
    let ext = req.extensions_mut();
    let cookie_jar = ext
        .get_mut::<Cookies>()
        .expect("get cookies in extension fail");
    let uuid_cookie = cookie_jar.get(UUID_COOKIE_NAME);
    let uuid;
    if uuid_cookie.is_none() {
        uuid = uuid::Uuid::new_v4().to_string();
        let cookie = Cookie::build(UUID_COOKIE_NAME, uuid.clone())
            .permanent()
            .path("/")
            .http_only(true)
            .finish();
        cookie_jar.add(cookie);
    } else {
        uuid = uuid_cookie.unwrap().value().to_string();
    }
    ext.insert::<AttchedUuid>(AttchedUuid(uuid));

    next.run(req).await
}
