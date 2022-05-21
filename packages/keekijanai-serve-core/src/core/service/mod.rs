pub trait Service {
    fn serve() -> Self;
    fn init();
}
