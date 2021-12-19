use num_derive::FromPrimitive;
use num_traits::{FromPrimitive, ToPrimitive};
use poem_openapi::Object;
use sea_query::{Iden, Value};




use crate::core::db::ActiveColumn;

#[derive(FromPrimitive, ToPrimitive, PartialEq, Eq, Hash)]
pub enum StarType {
    UnStar = 0,
    Bad,
    JustOK,
    Good,
}

#[derive(Iden)]
pub enum KeekijanaiStar {
    Table,
    Id,
    UserId,
    Star,
    Belong
}

pub type StarModelColumns = KeekijanaiStar;

#[derive(sqlx::FromRow, Debug)]
pub struct StarModel {
    pub id: i64,
    pub user_id: String,
    pub star_type: i32,
    pub belong: String
}

#[derive(Default, Debug, Clone, Object)]
pub struct StarActiveModel {
    pub id: ActiveColumn<i64>,
    pub user_id: ActiveColumn<String>,
    pub star_type: ActiveColumn<i32>,
    pub belong: ActiveColumn<String>
}

pub struct Star {
    pub id: i64,
    pub user_id: String,
    pub star_type: StarType,
    pub belong: String
}

impl From<StarModel> for Star {
    fn from(star: StarModel) -> Self {
        Self {
            id: star.id,
            user_id: star.user_id,
            star_type: FromPrimitive::from_i32(star.star_type).unwrap(),
            belong: star.belong,
        }
    }
}

impl From<Star> for StarModel {
    fn from(star: Star) -> Self {
        Self {
            id: star.id,
            user_id: star.user_id,
            star_type: ToPrimitive::to_i32(&star.star_type).unwrap(),
            belong: star.belong,
        }
    }
}

impl From<Star> for StarActiveModel {
    fn from(star: Star) -> Self {
        let star_type = ToPrimitive::to_i32(&star.star_type).unwrap();
        Self {
            id: star.id.into(),
            user_id: star.user_id.into(),
            star_type: star_type.into(),
            belong: star.belong.into(),
        }
    }
}

impl StarActiveModel {
    pub fn get_set_columns(&self) -> (Vec<KeekijanaiStar>, Vec<Value>) {
        let mut columns = vec![];
        let mut values: Vec<Value> = vec![];

        if self.id.is_set() {
            columns.push(StarModelColumns::Id);
            values.push(self.id.clone().unwrap().into());
        }
        if self.user_id.is_set() {
            columns.push(StarModelColumns::UserId);
            values.push(self.user_id.clone().unwrap().into());
        }
        if self.star_type.is_set() {
            columns.push(StarModelColumns::Star);
            values.push(self.star_type.clone().unwrap().into());
        }
        if self.belong.is_set() {
            columns.push(StarModelColumns::Belong);
            values.push(self.belong.clone().unwrap().into());
        }

        return (columns, values);
    }

    pub fn get_set_entries(&self) -> Vec<(StarModelColumns, Value)> {
        let (mut columns, mut values) = self.get_set_columns();
        let mut v = vec![];
        let n = columns.len();
        for _i in 0..n {
            v.push((columns.pop().unwrap(), values.pop().unwrap()));
        }
        return v;
    }
}
