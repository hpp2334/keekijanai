pub trait DIComponent {
    fn build(container: &DIContainer) -> Self;
}

pub struct DIContainer {}

impl DIContainer {
    pub fn get() -> Self {
        DIContainer {}
    }

    pub fn resolve<T>(&self) -> T
    where
        T: DIComponent,
    {
        let instance = T::build(self);
        instance
    }
}
