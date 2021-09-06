// Wasm Bindgen
extern crate wasm_bindgen;
use wasm_bindgen::{prelude::*};

extern crate console_error_panic_hook;
use std::{cell::RefCell, sync::Arc};

// Arrow
extern crate arrow;
use arrow::{datatypes::{DataType, Field, Schema}, record_batch::RecordBatch};
use arrow::csv::Reader;

// Console
mod console;
mod console_js_log;

// Stream Buff
mod streambuf;
use streambuf::WebFileReader;

// Record Batch
mod record_batch_util;

// Analyze
mod analyze;
mod analyze_api;

// Bindings
mod bindings;
use crate::{analyze::{filter_with, get_columns, sort_batch}, analyze_api::query};

extern crate serde;
use serde::{Serialize, Deserialize};

//STATE
pub struct State {
    pub record_batches: Option<Vec<RecordBatch>>
}

thread_local! {
    static STATE: RefCell<State> = RefCell::new(State {
        record_batches: None
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

fn _with_state_mut<Callback, ReturnType>(cb: Callback) -> ReturnType
where
    Callback: FnOnce(&mut State) -> ReturnType,
{
    STATE.with(|s| cb(&mut s.borrow_mut()))
}

fn get_record_batches() ->  Option<Vec<RecordBatch>> {
    with_state(|s| s.record_batches.clone())
}

fn _set_record_batches(record_batches: Vec<RecordBatch>) {
    _with_state_mut(|s| s.record_batches = Some(record_batches));
}

fn init_schema() -> Schema {

    let field_operator = Field::new("operator", DataType::Utf8, false);
    let field_uir_code = Field::new("uir_code", DataType::Utf8, false);
    let field_srcline = Field::new("srcline", DataType::Utf8, false);
    let field_comm = Field::new("comm", DataType::Utf8, false);
    let field_dso = Field::new("dso", DataType::Utf8, false);
    let field_ev_name = Field::new("ev_name", DataType::Utf8, false);
    let field_symbol = Field::new("symbol", DataType::Utf8, false);
    let field_brstack = Field::new("brstack", DataType::Utf8, false);
    let field_brstacksym =  Field::new("brstacksym", DataType::Utf8, false);
    let field_callchain =  Field::new("callchain", DataType::Utf8, false);
    let field_ip = Field::new("ip", DataType::Utf8, false);
    let field_pid = Field::new("pid", DataType::Int64, false);
    let field_datasrc = Field::new("datasrc", DataType::Int64, false);
    let field_time = Field::new("time", DataType::Float64, false);
    let field_period = Field::new("period", DataType::Int64, false);
    let field_tid = Field::new("tid", DataType::Int64, false);
    let field_cpu = Field::new("cpu", DataType::Int64, false);
    let field_iregs = Field::new("iregs", DataType::Int64, false);
    let field_mapping_via = Field::new("mapping_via", DataType::Utf8, false);
    let field_dump_linenr = Field::new("dump_linenr", DataType::Int64, false);
    let field_pipeline = Field::new("pipeline", DataType::Utf8, false);
    let field_addr = Field::new("addr", DataType::Int64, false);
    let field_phys_addr = Field::new("phys_addr", DataType::Int64, false);
    let field_time_delta = Field::new("time_delta", DataType::Int64, false);


    let schema = Schema::new(vec![field_operator, field_uir_code, field_srcline, field_comm, field_dso, field_ev_name, field_symbol, field_brstack, field_brstacksym, field_callchain, field_ip, field_pid, field_datasrc, field_time, field_period, field_tid, field_cpu, field_iregs, field_mapping_via, field_dump_linenr, field_pipeline, field_addr, field_phys_addr, field_time_delta]);

    schema
}


fn init_record_batches(file_size: i32, with_delimiter: u8, with_header: bool, with_projection: Vec<usize>) -> Vec<RecordBatch> {

    let schema = init_schema();

    let mut reader = Reader::new(
    WebFileReader::new_from_file(file_size),
    Arc::new(schema),
    with_header,
    Some(with_delimiter),
    1024,
    None,
    Some(with_projection));

    let mut vec = Vec::new();

    while let Some(item) = reader.next() {
        let batch = item.unwrap();
        vec.push(batch);
    }

    vec
}

#[wasm_bindgen(js_name = "analyzeFile")]
pub fn analyze_file(file_size: i32){

    let test = query("query");

    let now = instant::Instant::now();

    let semi_colon = 59;
    let batches = init_record_batches(file_size, semi_colon, true, vec![0 as usize, 5 as usize, 13 as usize, 20 as usize]);

    let elapsed = now.elapsed();
    print_to_js_with_obj(&format!("{:?}", elapsed).into()); 
    // let batches = set_record_batches(batches);

    //let batch = get_columns(batches, vec!["operator","time","ev_name","pipeline"]);
    let batch = get_columns(batches, vec![0,1,2,3]);

    let sorted_batch = sort_batch(&batch, 2);


    //let filtered_batch = filter_with("operator", "No Operator", &batch);
    let filtered_batch = filter_with(1,"", &batch);



    /* let events = Analyze::events(&batch);

    let event_batch = RecordBatchUtil::create_record_batch_events(events);

    let event_cursor = RecordBatchUtil::write_record_batch_to_cursor(&event_batch);

    set_record_batch(batch);

    send_events_to_js(event_cursor.into_inner()); */
}


#[wasm_bindgen(js_name = "requestChartData")]
pub fn request_chart_data(sql_query: &str) {

    let batch = get_record_batches().unwrap();
    
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
