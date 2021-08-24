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

use crate::bindings::{send_arrow_result_to_js, send_events_to_js};
mod bindings;

//STATE
pub struct State {
    pub record_batch: Option<RecordBatch>
}

thread_local! {
    static STATE: RefCell<State> = RefCell::new(State {
        record_batch: None
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

fn get_record_batch_from_state() ->  Option<RecordBatch> {
    with_state(|s| s.record_batch.clone())
}

fn set_record_batch(record_batch: RecordBatch) {
    with_state_mut(|s| s.record_batch = Some(record_batch));
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

    let events = Analyze::events(&batch);

    let event_batch = RecordBatchUtil::create_record_batch_events(events);

    let event_cursor = RecordBatchUtil::write_record_batch_to_cursor(&event_batch);

    set_record_batch(batch);

    send_events_to_js(event_cursor.into_inner());
}

#[wasm_bindgen(js_name = "requestChartData")]
pub fn request_chart_data(chart_name: &str, event_name: &str) {
    match chart_name {
        "bar_chart" => {
            let batch = get_record_batch_from_state().unwrap();
            let tuple = Analyze::data_for_bar_chart(&batch, &event_name);
            let batch = RecordBatchUtil::create_record_batch(tuple.0, tuple.1);
            let cursor = RecordBatchUtil::write_record_batch_to_cursor(&batch);
            send_arrow_result_to_js(cursor.into_inner());
        }
        "swim_lanes" => {
            todo!()
        }
        &_ => {
            todo!()
        }
    }
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
