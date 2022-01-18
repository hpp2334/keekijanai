use poem_openapi::Tags;

#[derive(Tags)]
pub enum ApiTags {
    Ping,
    Stat,
    Star,
    Comment,
    Auth,
    Time,
}
