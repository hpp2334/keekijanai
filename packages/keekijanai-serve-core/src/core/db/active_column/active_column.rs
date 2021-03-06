use std::{default::Default, marker::PhantomData};

use serde::{de::Visitor, Deserialize, Serialize};

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

#[derive(PartialEq, Eq, Clone, Debug, Serialize)]
pub enum ActiveColumn<T> {
    Set(T),
    Unset,
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
        *self = ActiveColumn::Set(value);
    }
}

impl<T> From<Option<T>> for ActiveColumn<T> {
    fn from(value: Option<T>) -> Self {
        return if value.is_none() {
            ActiveColumn::Unset
        } else {
            ActiveColumn::Set(value.unwrap())
        };
    }
}

impl_column! {i32, i64, u32, u64, String}

// modify from serde source code
// https://github.com/serde-rs/serde/blob/master/serde/src/de/impls.rs

struct ActiveColumnVisitor<T> {
    marker: PhantomData<T>,
}

impl<'de, T> Visitor<'de> for ActiveColumnVisitor<T>
where
    T: Deserialize<'de>,
{
    type Value = ActiveColumn<T>;

    fn expecting(&self, formatter: &mut std::fmt::Formatter) -> std::fmt::Result {
        formatter.write_str("option")
    }

    fn visit_unit<E>(self) -> Result<Self::Value, E>
    where
        E: serde::de::Error,
    {
        Ok(ActiveColumn::Unset)
    }

    fn visit_none<E>(self) -> Result<Self::Value, E>
    where
        E: serde::de::Error,
    {
        Ok(ActiveColumn::Unset)
    }

    fn visit_some<D>(self, deserializer: D) -> Result<Self::Value, D::Error>
    where
        D: serde::Deserializer<'de>,
    {
        T::deserialize(deserializer).map(ActiveColumn::Set)
    }
}

impl<'de, T> Deserialize<'de> for ActiveColumn<T>
where
    T: Deserialize<'de>,
{
    fn deserialize<D>(deserializer: D) -> Result<Self, D::Error>
    where
        D: serde::Deserializer<'de>,
    {
        deserializer.deserialize_option(ActiveColumnVisitor {
            marker: PhantomData,
        })
    }
}
