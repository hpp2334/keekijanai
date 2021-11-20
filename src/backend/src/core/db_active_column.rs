
use std::default::Default;

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

#[derive(PartialEq, Eq, Clone)]
pub enum ActiveColumn<T> {
    Set(T),
    Unset
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
    pub fn unwrap(&self) -> T {
        let cloned = self.clone();
        if let ActiveColumn::Set(x) = cloned {
            return x;
        }
        panic!("value is unset");
    }
}

impl<T> Default for ActiveColumn<T> {
    fn default() -> ActiveColumn<T> {
        ActiveColumn::Unset
    }
}


impl<T> From<Option<T>> for ActiveColumn<T> {
    fn from(value: Option<T>) -> Self {
        return if value.is_none() { ActiveColumn::Unset } else { ActiveColumn::Set(value.unwrap()) }
    }
}

impl_column!{i32, i64, u32, u64, String}