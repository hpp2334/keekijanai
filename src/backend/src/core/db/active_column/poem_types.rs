// modify from https://github.com/poem-web/poem/blob/master/poem-openapi/src/types/external/optional.rs

use std::borrow::Cow;

use poem::{http::HeaderValue, web::Field as PoemField};
use serde_json::Value;

use poem_openapi::{
    registry::{MetaSchemaRef, Registry},
    types::{
        ParseError, ParseFromJSON, ParseFromMultipartField, ParseFromParameter, ParseResult,
        ToHeader, ToJSON, Type,
    },
};

use super::ActiveColumn;

impl<T: Type> Type for ActiveColumn<T> {
    const IS_REQUIRED: bool = false;

    type RawValueType = T::RawValueType;

    type RawElementValueType = T::RawElementValueType;

    fn name() -> Cow<'static, str> {
        T::name()
    }

    fn schema_ref() -> MetaSchemaRef {
        T::schema_ref()
    }

    fn register(registry: &mut Registry) {
        T::register(registry);
    }

    fn as_raw_value(&self) -> Option<&Self::RawValueType> {
        match self {
            ActiveColumn::Set(value) => value.as_raw_value(),
            ActiveColumn::Unset => None,
        }
    }

    fn raw_element_iter<'a>(
        &'a self,
    ) -> Box<dyn Iterator<Item = &'a Self::RawElementValueType> + 'a> {
        match self {
            ActiveColumn::Set(value) => value.raw_element_iter(),
            ActiveColumn::Unset => Box::new(std::iter::empty()),
        }
    }
}

impl<T: ParseFromJSON> ParseFromJSON for ActiveColumn<T> {
    fn parse_from_json(value: Value) -> ParseResult<Self> {
        match value {
            Value::Null => Ok(ActiveColumn::Unset),
            value => Ok(ActiveColumn::Set(
                T::parse_from_json(value).map_err(ParseError::propagate)?,
            )),
        }
    }
}

impl<T: ParseFromParameter> ParseFromParameter for ActiveColumn<T> {
    fn parse_from_parameter(_value: &str) -> ParseResult<Self> {
        unreachable!()
    }

    fn parse_from_parameters<I: IntoIterator<Item = A>, A: AsRef<str>>(
        iter: I,
    ) -> ParseResult<Self> {
        let mut iter = iter.into_iter().peekable();

        if iter.peek().is_none() {
            return Ok(ActiveColumn::Unset);
        }

        T::parse_from_parameters(iter)
            .map_err(ParseError::propagate)
            .map(ActiveColumn::Set)
    }
}

#[poem::async_trait]
impl<T: ParseFromMultipartField> ParseFromMultipartField for ActiveColumn<T> {
    async fn parse_from_multipart(value: Option<PoemField>) -> ParseResult<Self> {
        match value {
            Some(value) => T::parse_from_multipart(Some(value))
                .await
                .map_err(ParseError::propagate)
                .map(ActiveColumn::Set),
            None => Ok(ActiveColumn::Unset),
        }
    }
}

impl<T: ToJSON> ToJSON for ActiveColumn<T> {
    fn to_json(&self) -> Value {
        match self {
            ActiveColumn::Set(value) => value.to_json(),
            ActiveColumn::Unset => Value::Null,
        }
    }
}

impl<T: ToHeader> ToHeader for ActiveColumn<T> {
    fn to_header(&self) -> Option<HeaderValue> {
        match self {
            ActiveColumn::Set(value) => value.to_header(),
            ActiveColumn::Unset => None,
        }
    }
}