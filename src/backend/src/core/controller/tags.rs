use poem_openapi::Tags;

#[derive(Tags)]
pub enum ApiTags {
    Ping,
    Star,
    Comment,
    Auth,
}
