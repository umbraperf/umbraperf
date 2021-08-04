extern crate wasm_bindgen;
use arrow::csv::Reader;
use streambuf::WebFileReader;
use wasm_bindgen::prelude::*;
use csv::ReaderBuilder;
use csv::ByteRecord;

use std::cell::RefCell;

use std::io::{BufRead, Read};

extern crate arrow;

extern crate console_error_panic_hook;

mod console;
mod console_js_log;
mod streambuf;
mod bindings;

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
pub fn analyze_file(file_size: i32){
    print_to_js("Analyzing is started");

    let mut newrdr = ReaderBuilder::new();
    newrdr.has_headers(false);
    newrdr.buffer_capacity(6);
    let mut rdr = newrdr.from_reader(WebFileReader::new_from_file(file_size));

    let mut record = ByteRecord::new();
    while rdr.read_byte_record(&mut record).unwrap() == true {
        print_to_js_with_obj(&format!("{:?}", &record).into());
    }

    /* let arrow_reader_builder = arrow::c&sv::reader::ReaderBuilder::new();
    let cursor_reader =  arrow::csv::reader::ReaderBuilder::build(arrow_reader_builder, WebFileReader::new_from_file());
    let mut reader = cursor_reader.unwrap();

    print_to_js("Reader");

    let batch = &reader.next().unwrap().unwrap();
    print_to_js_with_obj(&format!("{:?}", &batch).into()); */

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
