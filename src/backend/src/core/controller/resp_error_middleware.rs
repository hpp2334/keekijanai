use async_trait::async_trait;
use poem::{Body, Endpoint, IntoResponse, Middleware, Request, Response};
use serve_resp_err::ServeRespErr;
use std::fmt::Debug;

pub struct RespErrorMiddleware;

impl RespErrorMiddleware {
    pub fn new() -> Self {
        Self
    }
}

impl<E: Endpoint> Middleware<E> for RespErrorMiddleware {
    type Output = RespErrorMiddlewareImpl<E>;

    fn transform(&self, ep: E) -> Self::Output {
        RespErrorMiddlewareImpl { ep }
    }
}

pub struct RespErrorMiddlewareImpl<E> {
    ep: E,
}

impl<E> Debug for RespErrorMiddlewareImpl<E> {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        write!(f, "RespErrorMiddleware")
    }
}

#[async_trait]
impl<E: Endpoint> Endpoint for RespErrorMiddlewareImpl<E> {
    type Output = Response;

    #[tracing::instrument]
    async fn call(&self, req: Request) -> poem::Result<Self::Output> {
        tracing::debug!("before call req");
        let res = self.ep.call(req).await;

        match res {
            Ok(resp) => {
                tracing::debug!("get response");
                let resp = resp.into_response();
                Ok(resp)
            }
            Err(err) => {
                let status = err.status();

                if status.as_u16() >= 500 {
                    tracing::error!("{:?}", err);
                }

                let resp_error = downcast_to_serve_resp_err(err);
                let body = Body::from_json(resp_error).unwrap();
                let resp = Response::builder()
                    .typed_header(poem::web::headers::ContentType::json())
                    .status(status)
                    .body(body);
                Ok(resp)
            }
        }
    }
}

macro_rules! try_downcast_err {
    ($error:expr, $($x:ty),+) => {
        $(
            let downcasted = $error.downcast::<$x>();
            if downcasted.is_ok() {
                let resp_err: ServeRespErr = downcasted.unwrap().into();
                return resp_err;
            }
            $error = downcasted.unwrap_err();
        )+
    };
}

#[allow(unused_assignments)]
fn downcast_to_serve_resp_err(mut error: poem::Error) -> ServeRespErr {
    use crate::modules::auth::error as auth_error;
    use crate::modules::user::error as user_error;

    try_downcast_err! {
        error,
        user_error::InsufficientPrivilege,
        auth_error::HasLogin
    }

    let status = error.status().as_u16();
    if status >= 400 && status < 500 {
        return ServeRespErr {
            code: "General/CommonError",
            params: vec![error.to_string()],
        }
    }

    return ServeRespErr::default();
}

// // expaneded
// fn downcast_to_serve_resp_err(mut error: poem::Error) -> ServeRespErr {
//     use backend::modules::auth::error as auth_error;
//     use backend::modules::user::error as user_error;
//     let downcasted = error.downcast::<user_error::InsufficientPrivilege>();
//     if downcasted.is_ok() {
//         let resp_err: ServeRespErr = downcasted.unwrap().into();
//         return resp_err;
//     }
//     error = downcasted.unwrap_err();
//     let downcasted = error.downcast::<auth_error::HasLogin>();
//     if downcasted.is_ok() {
//         let resp_err: ServeRespErr = downcasted.unwrap().into();
//         return resp_err;
//     }
//     error = downcasted.unwrap_err();
//     return ServeRespErr::default();
// }
