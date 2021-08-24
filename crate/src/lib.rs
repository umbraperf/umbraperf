extern crate wasm_bindgen;
use arrow::array::{Array, BooleanArray, Int32Array, StringArray};
use arrow::datatypes::{DataType, Field, Int64Type, Schema};
use arrow::ipc::{Utf8, Utf8Builder};
use wasm_bindgen::prelude::*;

use std::cell::RefCell;

// Arrow
extern crate arrow;
use arrow::{array::Int8Array};
use arrow::record_batch::RecordBatch;


extern crate console_error_panic_hook;

mod console;
mod console_js_log;
mod streambuf;
use streambuf::WebFileReader;
mod record_batch_util;
use record_batch_util::RecordBatchUtil;

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

    let semi_colon = 59;
    let arrow_reader_builder = arrow::csv::reader::ReaderBuilder::new().has_header(false).with_delimiter(semi_colon).with_projection(vec![0 as usize, 5 as usize]);
    let cursor_reader =  arrow::csv::reader::ReaderBuilder::build(arrow_reader_builder, WebFileReader::new_from_file(file_size));
    let mut reader = cursor_reader.unwrap();

    let batch = &reader.next().unwrap().unwrap();
    print_to_js_with_obj(&format!("{:?}", &batch).into()); 
    //aggregate_sum(&batch);
    use std::collections::HashMap;
    let mut operator_number_map = HashMap::new();


    let column = batch.column(0);
    let arrow = arrow::array::as_string_array(column);

    let column_ev_name = batch.column(1);
    let arrow_event_name = arrow::array::as_string_array(column_ev_name);

    let mut counter = 0;
    while counter < arrow.len() {

        let event = arrow_event_name.value(counter);
        let operator = arrow.value(counter);

        if event.contains("cycles:ppp") {
            if let Some(sum) = operator_number_map.get(operator) {
                operator_number_map.insert(operator, sum + 1);
            } else {
                operator_number_map.insert(operator, 1);
            }
        }
        counter += 1;
    }

    print_to_js_with_obj(&format!("{:?}", operator_number_map).into());

    let mut k_vec = Vec::new();
    let mut v_vec = Vec::new();
    for (k, &v) in operator_number_map.iter() {
        k_vec.push(Some(*k));
        v_vec.push(v);
    }
    

    let string_vec = k_vec;

    let int_vec = v_vec;

    let batch = RecordBatchUtil::create_record_batch(string_vec, int_vec);

    let cursor = RecordBatchUtil::write_record_batch_to_cursor(&batch);

    store_arrow_result_from_rust(cursor.into_inner());



}

fn aggregate_sum(record_batch: &RecordBatch) {


    let array = record_batch.column(0);
    let primitive_array = arrow::array::as_primitive_array::<Int64Type>(array);

    let sum = arrow::compute::kernels::aggregate::sum(primitive_array);
    print_to_js_with_obj(&format!("{}", sum.unwrap()).into());
    set_sum(sum.unwrap() as i32);
    store_result_from_rust(sum.unwrap() as i32, 0);

    // let cursor = write_record_batch_to_cursor(&create_record_batch());

    //store_arrow_result_from_rust(cursor.into_inner());

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
