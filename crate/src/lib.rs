extern crate wasm_bindgen;
use arrow::{record_batch::RecordBatch};
use wasm_bindgen::prelude::*;

use std::cell::RefCell;

// Arrow
extern crate arrow;


extern crate console_error_panic_hook;

mod console;
mod console_js_log;
mod streambuf;
use streambuf::WebFileReader;
mod record_batch_util;
use record_batch_util::RecordBatchUtil;

mod analyze;
use analyze::Analyze;

use crate::bindings::{store_arrow_result_from_rust};
mod bindings;

//STATE
pub struct State {
    pub sum: i32,
}

thread_local! {
    static STATE: RefCell<State> = RefCell::new(State {
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

pub fn set_sum(new_sum: i32) {
    with_state_mut(|s| s.sum = new_sum);
}

fn get_record_batch(file_size: i32, with_delimiter: u8, with_header: bool, with_projection: Vec<usize>) -> RecordBatch {

    let arrow_reader_builder = arrow::csv::reader::ReaderBuilder::new().has_header(with_header).with_delimiter(with_delimiter).with_projection(with_projection);
    let cursor_reader =  arrow::csv::reader::ReaderBuilder::build(arrow_reader_builder, WebFileReader::new_from_file(file_size));
    let mut reader = cursor_reader.unwrap();

    reader.next().unwrap().unwrap()
}

#[wasm_bindgen(js_name = "analyzeFile")]
pub fn analyze_file(file_size: i32){

    let semi_colon = 59;
    let batch = get_record_batch(file_size, semi_colon, true, vec![0 as usize, 5 as usize]);
    
    let tuple = Analyze::data_for_bar_chart(&batch);
    
    let batch = RecordBatchUtil::create_record_batch(tuple.0, tuple.1);

    let cursor = RecordBatchUtil::write_record_batch_to_cursor(&batch);

    store_arrow_result_from_rust(cursor.into_inner());

}


// PRINTING
fn print_to_js(s: &str) {
    use web_sys::console;
    console::log_1(&format!("{}", s).into()); 
}

fn print_to_js_with_obj(s: &JsValue) {
    use web_sys::console;
    console::log_1(s); 
}
