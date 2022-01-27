
pub fn single<T>(mut vec: Vec<T>) -> anyhow::Result<T> {
    if vec.len() != 1 {
        Err(anyhow::anyhow!("not only one item"))
    } else {
        Ok(vec.pop().unwrap())
    }
}
