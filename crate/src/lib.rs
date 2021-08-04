extern crate wasm_bindgen;
use wasm_bindgen::prelude::*;

use js_sys::{Uint8Array};

use std::sync::Arc;
use std::cell::RefCell;
use std::io::{BufRead};
use std::{io};

extern crate arrow;
use arrow::array::Array;
use web_sys::Worker;

extern crate console_error_panic_hook;

mod bindings;
mod console;
mod console_js_log;
mod streambuf;

use bindings::WebFile;

//STATE
pub struct State {
    pub vec: Vec<u8>,
    pub processed_chunks: i32,
    pub expected_chunks: i32,
    pub sum: i32,
}

thread_local! {
    static STATE: RefCell<State> = RefCell::new(State {
        vec: Vec::new(),
        processed_chunks: 0,
        expected_chunks: 0,
        sum: 0,
    });
}


// STATE ACCESS
fn with_state<Callback, ReturnType>(cb: Callback) -> ReturnType
where
    Callback: FnOnce(&State) -> ReturnType,
{
    STATE.with(|s| cb(&s.borrow()))
}

fn with_state_mut<Callback, ReturnType>(cb: Callback) -> ReturnType
where
    Callback: FnOnce(&mut State) -> ReturnType,
{
    STATE.with(|s| cb(&mut s.borrow_mut()))
}

pub fn get_state() -> i32 {
    with_state(|s| s.sum)
}

pub fn set_expected_chunks(expected_chunks: i32) -> i32 {
    with_state_mut(|s| {
        s.expected_chunks = expected_chunks;
    });
    return 0;
}

#[wasm_bindgen(js_name = "startFileReading")]
pub fn start_file_reading(wo: web_sys::Worker) {
    print_to_js_with_obj(&wo);
    web_sys::Worker::post_message(&wo, &format!("HALLO").into());
    print_to_js("Start File Reading triggerd.");
}


async fn read_chunk(p: &WebFile, from: i32, size: i32) -> Result<Uint8Array, js_sys::Error> {
    let s: &str = "t";
    let array = p.ask_js_for_chunk(from, size).await?.into();  
    
    print_to_js("Print js-chunk");
    print_to_js_with_obj(&format!("{:?}",&array).into());
    Ok(array)
}

// PRINTING
fn print_to_js(s: &str) {
    use web_sys::console;
    unsafe { console::log_1(&format!("{}", s).into()); }
}

fn print_to_js_with_obj(s: &JsValue) {
    use web_sys::console;
    unsafe { console::log_1(s); }
}