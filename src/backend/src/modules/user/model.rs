
use sea_query::{Iden, Value};



use crate::core::db::ActiveColumn;

#[derive(Clone, Debug, PartialEq)]
pub enum UserRole {
    Anonymous = 0,
    Public,
    Admin
}

impl From<i32> for UserRole {
    fn from(v: i32) -> Self {
        match v {
            0 => UserRole::Anonymous,
            1 => UserRole::Public,
            2 => UserRole::Admin,
            _ => UserRole::Anonymous
        }
    }
}

impl From<UserRole> for i32 {
    fn from(role: UserRole) -> Self {
        role as i32
    }
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

#[derive(Clone)]
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

impl From<UserModel> for User {
    fn from(user: UserModel) -> Self {
        Self {
            id: user.id,
            name: user.name,
            role: user.role.into(),
            password: user.password,
            provider: user.provider,
            in_provider_id: user.in_provider_id,
            last_login: user.last_login,
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
            role: user.role.into(),
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
        let role: i32 = user.role.into();
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
