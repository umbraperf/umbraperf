extern crate wasm_bindgen;
use wasm_bindgen::prelude::*;
use bindings::*;

use js_sys::{Uint8Array};

use std::sync::Arc;
use std::cell::RefCell;
use std::io::{BufRead};
use std::{io};

extern crate arrow;
use arrow::array::Array;

extern crate console_error_panic_hook;

mod bindings;
mod console;
mod console_js_log;
mod streambuf;

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


#[wasm_bindgen(js_name = "analyzeFile")]
pub fn analyze_file(){
    print_to_js("Analyze");
    let result = binding_read_chunk_from_js(0, 10);
    print_to_js(&result.to_string());
}

#[wasm_bindgen]
pub fn binding_read_chunk_from_js(offset: i32, bytes: i32) -> i32 {
    return bindings::read_file_chunk(offset, bytes)
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