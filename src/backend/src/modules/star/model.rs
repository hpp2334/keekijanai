pub enum StarType {
    UnStar,
    Bad,
    JustOK,
    Good,
}
pub struct Star {
    pub id: i32,
    pub user_id: String,
    pub scope: Option<String>,
    pub star_lv: Option<StarType>,
}