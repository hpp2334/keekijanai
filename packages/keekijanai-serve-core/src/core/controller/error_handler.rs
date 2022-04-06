use axum::{http::StatusCode, response::IntoResponse};

use crate::core::ServeError;

pub(crate) async fn error_to_resp(err: anyhow::Error) -> (StatusCode, impl IntoResponse) {
    if let Ok(err) = err.downcast::<ServeError>() {
        (err.status.clone(), err)
    } else {
        (
            StatusCode::INTERNAL_SERVER_ERROR,
            ServeError {
                code: "Common/Internal",
                status: StatusCode::INTERNAL_SERVER_ERROR,
                params: vec![],
            },
        )
    }
}
