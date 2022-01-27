
use std::default::Default;


use serde::{Deserialize, Serialize};

macro_rules! impl_column {
    ($($x:ty),+) => {
        $(
            impl From<$x> for ActiveColumn<$x> {
                fn from(v: $x) -> Self {
                    ActiveColumn::Set(v)
                }
            }
        )+
    };
}

#[derive(PartialEq, Eq, Clone, Debug, Serialize, Deserialize)]
pub enum ActiveColumn<T> {
    Set(T),
    Unset
}

impl<T> Default for ActiveColumn<T> {
    fn default() -> Self {
        ActiveColumn::Unset
    }
}

impl<T: Clone> ActiveColumn<T> {
    pub fn is_unset(&self) -> bool {
        if let &ActiveColumn::Unset = self {
            return true;
        }
        return false;
    }
    pub fn is_set(&self) -> bool {
        !self.is_unset()
    }
    pub fn unwrap(&mut self) -> T {
        if self.is_unset() {
            panic!("value is unset");
        }
        let col = std::mem::take(self);
        if let ActiveColumn::Set(x) = col {
            return x;
        }
        panic!("value is unset");
    }
    pub fn unset(&mut self) {
        std::mem::take(self);
    }
    pub fn set(&mut self, value: T) {
        std::mem::replace(self, ActiveColumn::Set(value));
    }
}


impl<T> From<Option<T>> for ActiveColumn<T> {
    fn from(value: Option<T>) -> Self {
        return if value.is_none() { ActiveColumn::Unset } else { ActiveColumn::Set(value.unwrap()) }
    }
}

impl_column!{i32, i64, u32, u64, String}
