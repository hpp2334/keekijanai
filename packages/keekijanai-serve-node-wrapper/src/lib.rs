use std::sync::atomic::{AtomicBool, Ordering};

use keekijanai_serve_core::{EntireRequest, EntireResponse};
use neon::{handle::Managed, prelude::*};
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

fn optional_as_value<'a, T>(
    cx: &mut TaskContext<'a>,
    v: Option<Handle<'a, T>>,
) -> Handle<'a, JsValue>
where
    T: Managed + neon::types::Value,
{
    if let Some(v) = v {
        v.upcast::<JsValue>()
    } else {
        cx.null().upcast::<JsValue>()
    }
}
fn call_callback<'a>(
    cx: &mut TaskContext<'a>,
    callback: Root<JsFunction>,
    err: Option<Handle<'a, JsString>>,
    payload: Option<Handle<'a, JsObject>>,
) {
    let err = optional_as_value(cx, err);
    let payload = optional_as_value(cx, payload);
    let this_value = cx.null();
    callback
        .into_inner(cx)
        .call(cx, this_value, vec![err, payload])
        .unwrap();
}

fn parse_to_trans_req<'a>(cx: &mut FunctionContext, obj: &JsObject) -> NeonResult<EntireRequest> {
    let uri = obj.get::<JsString, _, _>(cx, "uri")?;
    let uri = uri.value(cx);

    let method = obj.get::<JsString, _, _>(cx, "method")?.value(cx);

    let headers = obj.get::<JsArray, _, _>(cx, "headers")?;
    let headers = headers
        .to_vec(cx)?
        .into_iter()
        .map(|value| -> NeonResult<(String, String)> {
            let value: Handle<JsArray> = value.downcast_or_throw(cx)?;
            let header_key = value.get::<JsString, _, _>(cx, 0)?;
            let header_key = header_key.value(cx);
            let header_value = value.get::<JsString, _, _>(cx, 1)?;
            let header_value = header_value.value(cx);
            Ok((header_key, header_value))
        })
        .collect::<NeonResult<Vec<_>>>();
    let headers = match headers {
        Ok(headers) => headers,
        Err(err) => return Err(err),
    };

    let body = obj.get::<JsValue, _, _>(cx, "body")?;
    let body = body.downcast::<JsString, _>(cx);
    let body = body.map_or(None, |v| Some(v.value(cx)));

    Ok(EntireRequest {
        uri,
        method,
        headers,
        body,
    })
}

fn process_entire_request(mut cx: FunctionContext) -> JsResult<JsNull> {
    init();

    let req = cx.argument::<JsObject>(0)?;
    let callback = cx.argument::<JsFunction>(1)?.root(&mut cx);

    let trans_req = parse_to_trans_req(&mut cx, &req)?;
    let channel = cx.channel();

    RUNTIME.spawn(async move {
        keekijanai_serve_core::init().await;

        let res = keekijanai_serve_core::process_entire_request(trans_req).await;

        channel.send(move |mut cx| {
            let res: NeonResult<Handle<JsObject>> = {
                let data = match std::string::String::from_utf8(res.data.to_vec()) {
                    Ok(data) => data,
                    Err(err) => {
                        let err_str = cx.string(err.to_string());
                        call_callback(&mut cx, callback, Some(err_str), None);
                        return Ok(());
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

                Ok(res_obj)
            };
            if let Err(e) = res {
                let err_str = cx.string(e.to_string());
                call_callback(&mut cx, callback, Some(err_str), None);
            } else if let Ok(res) = res {
                call_callback(&mut cx, callback, None, Some(res));
            }

            Ok(())
        });
    });

    Ok(cx.null())
}

#[neon::main]
fn main(mut cx: ModuleContext) -> NeonResult<()> {
    cx.export_function("processEntireRequest", process_entire_request)?;
    Ok(())
}
