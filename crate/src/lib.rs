extern crate wasm_bindgen;
use wasm_bindgen::prelude::*;

use std::cell::RefCell;

// Arrow
extern crate arrow;
use arrow::datatypes::Int64Type;
use arrow::record_batch::RecordBatch;

//Test Write for JS
use arrow::ipc::writer;
use std::io::Write;
use std::fs::File;
use std::io::Cursor;
use js_sys::Uint8Array;



extern crate console_error_panic_hook;

mod console;
mod console_js_log;
mod streambuf;
use streambuf::WebFileReader;

use crate::bindings::{store_result_from_rust, store_arrow_result_from_rust};
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


#[wasm_bindgen(js_name = "analyzeFile")]
pub fn analyze_file(file_size: i32){
    print_to_js("Analyzing is started");

    let arrow_reader_builder = arrow::csv::reader::ReaderBuilder::new().has_header(false).with_batch_size(4000);
    let cursor_reader =  arrow::csv::reader::ReaderBuilder::build(arrow_reader_builder, WebFileReader::new_from_file(file_size));
    let mut reader = cursor_reader.unwrap();

    print_to_js("Reader");

    let batch = &reader.next().unwrap().unwrap();
    print_to_js_with_obj(&format!("{:?}", &batch).into()); 
    aggregate_sum(&batch);

}

fn aggregate_sum(record_batch: &RecordBatch) {
    let array = record_batch.column(1);
    let primitive_array = arrow::array::as_primitive_array::<Int64Type>(array);
    let sum = arrow::compute::kernels::aggregate::sum(primitive_array);
    print_to_js_with_obj(&format!("{}", sum.unwrap()).into());
    set_sum(sum.unwrap() as i32);
    store_result_from_rust(sum.unwrap() as i32, 0);


    let mut buff = Cursor::new(vec![]);
    let options = arrow::ipc::writer::IpcWriteOptions::default();
    let mut dict = arrow::ipc::writer::DictionaryTracker::new(true);
    let encoded_schema = arrow::ipc::writer::IpcDataGenerator::schema_to_bytes(&arrow::ipc::writer::IpcDataGenerator::default(), &record_batch.schema(),  &options);
    let encoded_message = arrow::ipc::writer::IpcDataGenerator::encoded_batch(&arrow::ipc::writer::IpcDataGenerator::default(), &record_batch,  &mut dict, &options);

    arrow::ipc::writer::write_message(&mut buff, encoded_schema, &options);
    arrow::ipc::writer::write_message(&mut buff, encoded_message.unwrap().1, &options);

    store_arrow_result_from_rust(buff.into_inner());

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
