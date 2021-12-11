use std::net::SocketAddr;

use backend_router::{Router, Body, RouterService};

pub fn spawn_server(router: Router<Body, anyhow::Error>) -> String {
    let port = 5000;
    let service = RouterService::new(router).expect("build router service fail");
    let addr = SocketAddr::from(([127, 0, 0, 1], port));
    let server = hyper::Server::bind(&addr).serve(service);
    let _ = tokio::spawn(server);

    return format!("http://127.0.0.1:{}", port);
}
