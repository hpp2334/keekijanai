use std::sync::Arc;

use num_traits::{FromPrimitive, ToPrimitive};
use once_cell::sync::Lazy;
use sea_query::{Iden, Value};
use serde::{Deserialize, Serialize};

use crate::core::db::ActiveColumn;

#[derive(Clone, Debug, PartialEq, FromPrimitive, ToPrimitive)]
pub enum UserRole {
    Anonymous = 0,
    Public,
    Admin,
}

#[derive(Iden)]
pub enum KeekijanaiUser {
    Table,
    Id,
    Name,
    Role,
    Password,
    Provider,
    InProviderId,
    LastLogin,
    AvatarUrl,
    Email,
}

pub type UserModelColumns = KeekijanaiUser;

#[derive(sqlx::FromRow, Debug)]
pub struct UserModel {
    pub id: i64,
    pub name: String,
    pub role: i32,
    pub password: Option<String>,
    pub provider: String,
    pub in_provider_id: String,
    pub last_login: Option<i64>,
    pub avatar_url: Option<String>,
    pub email: Option<String>,
}

#[derive(Default, Debug)]
pub struct UserActiveModel {
    pub id: ActiveColumn<i64>,
    pub name: ActiveColumn<String>,
    pub role: ActiveColumn<i32>,
    pub password: ActiveColumn<String>,
    pub provider: ActiveColumn<String>,
    pub in_provider_id: ActiveColumn<String>,
    pub last_login: ActiveColumn<i64>,
    pub avatar_url: ActiveColumn<String>,
    pub email: ActiveColumn<String>,
}

#[derive(Clone, Debug)]
pub struct User {
    pub id: i64,
    pub name: String,
    pub role: UserRole,
    pub password: Option<String>,
    pub provider: String,
    pub in_provider_id: String,
    pub last_login: Option<i64>,
    pub avatar_url: Option<String>,
    pub email: Option<String>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct UserVO {
    pub id: i64,
    pub name: String,
    pub role: i16,
    pub provider: String,
    pub avatar_url: Option<String>,
    pub email: Option<String>,
}

impl User {
    pub fn is_anonymous_by_id(user_id: i64) -> bool {
        user_id == ANONYMOUS_USER.id
    }

    pub fn is_anonymous(&self) -> bool {
        self.role == UserRole::Anonymous
    }

    pub fn get_anonymous() -> Arc<User> {
        Arc::clone(&ANONYMOUS_USER)
    }
}

impl From<UserModel> for User {
    fn from(user: UserModel) -> Self {
        Self {
            id: user.id,
            name: user.name,
            role: FromPrimitive::from_i32(user.role).unwrap(),
            password: user.password,
            provider: user.provider,
            in_provider_id: user.in_provider_id,
            last_login: user.last_login,
            avatar_url: user.avatar_url,
            email: user.email,
        }
    }
}

impl From<User> for UserVO {
    fn from(user: User) -> Self {
        Self {
            id: user.id,
            name: user.name,
            role: ToPrimitive::to_i16(&user.role).unwrap(),
            provider: user.provider,
            avatar_url: user.avatar_url,
            email: user.email,
        }
    }
}

impl From<User> for UserModel {
    fn from(user: User) -> Self {
        Self {
            id: user.id,
            name: user.name,
            role: ToPrimitive::to_i32(&user.role).unwrap(),
            password: user.password,
            provider: user.provider,
            in_provider_id: user.in_provider_id,
            last_login: user.last_login,
            avatar_url: user.avatar_url,
            email: user.email,
        }
    }
}

impl From<User> for UserActiveModel {
    fn from(user: User) -> Self {
        let role: i32 = ToPrimitive::to_i32(&user.role).unwrap();
        Self {
            id: user.id.into(),
            name: user.name.into(),
            role: role.into(),
            password: user.password.into(),
            provider: user.provider.into(),
            in_provider_id: user.in_provider_id.into(),
            last_login: user.last_login.into(),
            avatar_url: user.avatar_url.into(),
            email: user.email.into(),
        }
    }
}

impl UserActiveModel {
    pub fn get_set_columns(&self) -> (Vec<KeekijanaiUser>, Vec<Value>) {
        let mut columns = vec![];
        let mut values: Vec<Value> = vec![];

        if self.id.is_set() {
            columns.push(UserModelColumns::Id);
            values.push(self.id.clone().unwrap().into());
        }
        if self.name.is_set() {
            columns.push(UserModelColumns::Name);
            values.push(self.name.clone().unwrap().into());
        }
        if self.role.is_set() {
            columns.push(UserModelColumns::Role);
            values.push(self.role.clone().unwrap().into());
        }
        if self.password.is_set() {
            columns.push(UserModelColumns::Password);
            values.push(self.password.clone().unwrap().into());
        }
        if self.provider.is_set() {
            columns.push(UserModelColumns::Provider);
            values.push(self.provider.clone().unwrap().into());
        }
        if self.in_provider_id.is_set() {
            columns.push(UserModelColumns::InProviderId);
            values.push(self.in_provider_id.clone().unwrap().into());
        }
        if self.last_login.is_set() {
            columns.push(UserModelColumns::LastLogin);
            values.push(self.last_login.clone().unwrap().into());
        }
        if self.avatar_url.is_set() {
            columns.push(UserModelColumns::AvatarUrl);
            values.push(self.avatar_url.clone().unwrap().into());
        }
        if self.email.is_set() {
            columns.push(UserModelColumns::Email);
            values.push(self.email.clone().unwrap().into());
        }

        return (columns, values);
    }

    pub fn get_set_entries(&self) -> Vec<(UserModelColumns, Value)> {
        let (mut columns, mut values) = self.get_set_columns();
        let mut v = vec![];
        let n = columns.len();
        for _i in 0..n {
            v.push((columns.pop().unwrap(), values.pop().unwrap()));
        }
        return v;
    }
}

pub static ANONYMOUS_USER: Lazy<Arc<User>> = Lazy::new(|| {
    let user = User {
        id: -1,
        name: "".to_string(),
        role: UserRole::Anonymous,
        password: None,
        provider: "self".to_string(),
        in_provider_id: "-1".to_string(),
        last_login: None,
        avatar_url: None,
        email: None,
    };

    Arc::new(user)
});
