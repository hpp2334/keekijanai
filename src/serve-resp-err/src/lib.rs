use serde::Serialize;

#[derive(Serialize)]
pub struct ServeRespErr {
    pub code: &'static str,
    pub params: Vec<String>,
}

impl Default for ServeRespErr {
    fn default() -> Self {
        ServeRespErr {
            code: "Internal/InternalError",
            params: std::vec::Vec::new(),
        }
    }
}
