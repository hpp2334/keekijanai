pub fn join_path(a: &str, b: &str) -> String {
    let a = normalize_path(a);
    let b = normalize_path(b);
    let path = a + b.as_str();
    let path = normalize_path(path.as_str());
    return path;
}

pub fn normalize_path(path: &str) -> String {
    let path = if path.ends_with("/") {
        path.get(0..path.len() - 1).unwrap()
    } else {
        path
    };
    let path = if path.starts_with("/") {
        path.get(1..path.len()).unwrap()
    } else {
        path
    };
    return "/".to_owned() + path;
}
