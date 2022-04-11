use std::sync::atomic::{AtomicBool, Ordering};

use keekijanai_serve_core::EntireRequest;
use neon::prelude::*;
use once_cell::sync::Lazy;
use tokio::runtime::Runtime;

static INIT_TAG: AtomicBool = AtomicBool::new(false);

static RUNTIME: Lazy<Runtime> = Lazy::new(|| {
    tokio::runtime::Builder::new_multi_thread()
        .enable_all()
        .build()
        .unwrap()
});

fn init() {
    let prev = INIT_TAG.compare_exchange(false, true, Ordering::SeqCst, Ordering::SeqCst);
    if let Ok(x) = prev {
        if x == false {
            tracing_subscriber::fmt::init();
        }
    }
}

fn parse_to_trans_req<'a>(cx: &mut FunctionContext, obj: &JsObject) -> NeonResult<EntireRequest> {
    let uri: Handle<JsString> = obj.get(cx, "uri")?.downcast_or_throw(cx)?;
    let uri = uri.value(cx);

    let method = obj
        .get(cx, "method")?
        .downcast_or_throw::<JsString, _>(cx)?
        .value(cx);

    let headers: Handle<JsArray> = obj.get(cx, "headers")?.downcast_or_throw(cx)?;
    let headers = headers
        .to_vec(cx)?
        .into_iter()
        .map(|value| -> NeonResult<(String, String)> {
            let value: Handle<JsArray> = value.downcast_or_throw(cx)?;
            let header_key: Handle<JsString> = value.get(cx, 0)?.downcast_or_throw(cx)?;
            let header_key = header_key.value(cx);
            let header_value: Handle<JsString> = value.get(cx, 1)?.downcast_or_throw(cx)?;
            let header_value = header_value.value(cx);
            Ok((header_key, header_value))
        })
        .collect::<NeonResult<Vec<_>>>();
    let headers = match headers {
        Ok(headers) => headers,
        Err(err) => return Err(err),
    };

    let body = obj.get(cx, "body")?.downcast::<JsString, _>(cx);
    let body = body.map_or(None, |v| Some(v.value(cx)));

    Ok(EntireRequest {
        uri,
        method,
        headers,
        body,
    })
}

fn process_entire_request(mut cx: FunctionContext) -> JsResult<JsObject> {
    init();

    let req = cx.argument::<JsObject>(0)?;

    let trans_req = parse_to_trans_req(&mut cx, &req)?;

    let res = RUNTIME.block_on(async move {
        keekijanai_serve_core::init().await;

        let res = keekijanai_serve_core::process_entire_request(trans_req).await;
        res
    });

    let data = match std::string::String::from_utf8(res.data.to_vec()) {
        Ok(data) => data,
        Err(err) => {
            let err_str = cx.string(err.to_string());
            return cx.throw(err_str)?;
        }
    };

    let headers_obj = JsArray::new(&mut cx, res.headers.len() as u32);
    let mut headers_enumer_iter = res.headers.into_iter().enumerate();
    while let Some((index, (key, value))) = headers_enumer_iter.next() {
        let pair = JsArray::new(&mut cx, 2);
        let key = cx.string(key);
        let value = cx.string(value);
        pair.set(&mut cx, 0, key)?;
        pair.set(&mut cx, 1, value)?;
        headers_obj.set(&mut cx, index as u32, pair)?;
    }
    let res_obj = cx.empty_object();

    let status_code = cx.number(res.status_code);
    res_obj.set(&mut cx, "statusCode", status_code)?;
    res_obj.set(&mut cx, "headers", headers_obj)?;
    let data = cx.string(data);
    res_obj.set(&mut cx, "body", data)?;

    JsResult::Ok(res_obj)
}

#[neon::main]
fn main(mut cx: ModuleContext) -> NeonResult<()> {
    cx.export_function("processEntireRequest", process_entire_request)?;
    Ok(())
}
