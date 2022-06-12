pub trait VecHelper<T> {
    fn single(self) -> anyhow::Result<Option<T>>;
    fn strict_single(self) -> anyhow::Result<T>;
}

impl<T> VecHelper<T> for Vec<T> {
    fn single(mut self) -> anyhow::Result<Option<T>> {
        let len = self.len();
        match len {
            0 => Ok(None),
            1 => Ok(self.pop()),
            _ => Err(anyhow::anyhow!("not only one item")),
        }
    }
    fn strict_single(mut self) -> anyhow::Result<T> {
        let len = self.len();
        match len {
            0 => Err(anyhow::anyhow!("vec is empty")),
            1 => Ok(self.pop().unwrap()),
            _ => Err(anyhow::anyhow!("not only one item")),
        }
    }
}
