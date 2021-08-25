// Wasm Bindgen
extern crate wasm_bindgen;
use wasm_bindgen::{prelude::*};

extern crate console_error_panic_hook;
use std::{cell::RefCell};

// Arrow
extern crate arrow;
use arrow::{record_batch::RecordBatch};

// Console
mod console;
mod console_js_log;

// Stream Buff
mod streambuf;
use streambuf::WebFileReader;

// Record Batch
mod record_batch_util;
use record_batch_util::RecordBatchUtil;

// Analyze
mod analyze;
use analyze::Analyze;

// Bindings
mod bindings;
use crate::bindings::{send_arrow_result_to_js, send_events_to_js};

extern crate serde;
use serde::{Serialize, Deserialize};

//STATE
pub struct State {
    pub record_batch: Option<RecordBatch>
}

thread_local! {
    static STATE: RefCell<State> = RefCell::new(State {
        record_batch: None
    });
}

#[derive(Serialize, Deserialize)]
pub struct Param {
    pub bucketsize: i32
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

fn get_record_batch() ->  Option<RecordBatch> {
    with_state(|s| s.record_batch.clone())
}

fn set_record_batch(record_batch: RecordBatch) {
    with_state_mut(|s| s.record_batch = Some(record_batch));
}


fn init_record_batch(file_size: i32, with_delimiter: u8, with_header: bool, with_projection: Vec<usize>) -> RecordBatch {

    // TODO variable Batch Size
    let arrow_reader_builder = arrow::csv::reader::ReaderBuilder::new().has_header(with_header).with_delimiter(with_delimiter).with_projection(with_projection).with_batch_size(100000);
    let cursor_reader =  arrow::csv::reader::ReaderBuilder::build(arrow_reader_builder, WebFileReader::new_from_file(file_size));
    let mut reader = cursor_reader.unwrap();

    reader.next().unwrap().unwrap()
}

#[wasm_bindgen(js_name = "analyzeFile")]
pub fn analyze_file(file_size: i32){

    let now = instant::Instant::now();

    let semi_colon = 59;
    let batch = init_record_batch(file_size, semi_colon, true, vec![0 as usize, 5 as usize, 13 as usize, 20 as usize]);

    let elapsed = now.elapsed();
    print_to_js_with_obj(&format!("{:?}", elapsed).into()); 

    let events = Analyze::events(&batch);

    let event_batch = RecordBatchUtil::create_record_batch_events(events);

    let event_cursor = RecordBatchUtil::write_record_batch_to_cursor(&event_batch);

    set_record_batch(batch);

    send_events_to_js(event_cursor.into_inner());
}


#[wasm_bindgen(js_name = "requestChartData")]
pub fn request_chart_data(chart_name: &str, event_name: &str, args: &JsValue) {

    let param: Param = args.into_serde().unwrap();
    print_to_js_with_obj(&format!("{:?}", param.bucketsize).into()); 

    let batch = get_record_batch().unwrap();
    match chart_name {
        "bar_chart" => {
            let tuple = Analyze::data_for_bar_chart(&batch, &event_name);
            let batch = RecordBatchUtil::create_record_batch(tuple.0, tuple.1);
            let cursor = RecordBatchUtil::write_record_batch_to_cursor(&batch);
            send_arrow_result_to_js(cursor.into_inner());
        }
        "swim_lanes" => {
            Analyze::data_for_swim_line(&batch, &event_name, "Todo", 0.200);
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
