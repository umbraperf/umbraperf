// Wasm Bindgen
extern crate wasm_bindgen;
use exec::rest::rest_api::eval_query;
use utils::print_to_cons::print_to_js_with_obj;
use wasm_bindgen::prelude::*;

// Aux
extern crate console_error_panic_hook;
use std::cell::RefCell;
use std::collections::HashMap;
use std::sync::Mutex;

// Arrow
extern crate arrow;
use arrow::record_batch::RecordBatch;

// Stream Buff
mod web_file {
    pub mod parquet_reader;
    pub mod serde_reader;
    pub mod streambuf;
    pub mod web_file_chunkreader;
}

// Analyze
mod exec {
    pub mod freq {
        pub mod abs_freq;
        pub mod freq;
        pub mod rel_freq;
    }
    pub mod basic {
        pub mod basic;
        pub mod count;
        pub mod filter;
        pub mod kpis;
    }
    pub mod rest {
        pub mod rest_api;
        pub mod rest_api_pars;
    }
}

// Utils
mod utils {
    pub mod bindings;
    pub mod print_to_cons;
    pub mod record_batch_util;
    pub mod string_util;
}
use crate::utils::bindings::notify_js_finished_reading;
use crate::web_file::serde_reader::SerdeDict;
use utils::bindings;
use utils::record_batch_util;
use std::sync::Arc;

pub struct RecordBatchShared {
    pub batch: RecordBatch
}

//STATE
pub struct State {
    pub record_batches: Option<Arc<RecordBatchShared>>,
    pub queries: Arc<Mutex<HashMap<String, RecordBatch>>>,
    pub dict: Option<Arc<SerdeDict>>,
    pub parquet_file_binary: Arc<Mutex<Vec<u8>>>,
}

thread_local! {
    static STATE: RefCell<State> = RefCell::new(State {
        record_batches: None,
        queries:  Arc::new(Mutex::new(HashMap::new())),
        dict: None,
        parquet_file_binary: Arc::new(Mutex::new(Vec::new()))
    });
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

fn get_record_batches() -> Option<Arc<RecordBatchShared>> {
    with_state(|s| s.record_batches.clone())
}

fn get_query_from_cache() -> Arc<Mutex<HashMap<String, RecordBatch>>> {
    with_state(|s| s.queries.clone())
}

fn get_parquet_file_binary() -> Arc<Mutex<Vec<u8>>> {
    with_state(|s| s.parquet_file_binary.clone())
}

fn append_to_parquet_file_binary(mut vec: Vec<u8>) {
    _with_state_mut(|s| {
        let mut t = s.parquet_file_binary.lock().unwrap();
        t.append(&mut vec);
    });
}

fn clear_cache() {
    _with_state_mut(|s| {
        let mut t = s.queries.lock().unwrap();
        t.clear();
    });
}

fn insert_query_to_cache(restful_string: &str, record_batch: RecordBatch) {
    _with_state_mut(|s| {
        let mut t = s.queries.lock().unwrap();
        t.insert(restful_string.to_string(), record_batch)
    });
}

fn set_record_batches(record_batches: RecordBatch) {
    let shared_record_batch = RecordBatchShared { batch: record_batches };
    _with_state_mut(|s| s.record_batches = Some(Arc::new(shared_record_batch)));
} 

fn get_serde_dict() -> Option<Arc<SerdeDict>> {
    with_state(|s| s.dict.clone())
}

fn set_serde_dict(serde_dict: SerdeDict) {
    _with_state_mut(|s| s.dict = Some(Arc::new(serde_dict)));
}

#[wasm_bindgen(js_name = "analyzeFile")]
pub fn analyze_file(file_size: i32) {
    clear_cache();

    let now = instant::Instant::now();
    
    let serde_reader = SerdeDict::read_dict(file_size as u64);
    set_serde_dict(serde_reader);
    let batches = record_batch_util::init_record_batches(file_size);

    let elapsed = now.elapsed();

    print_to_js_with_obj(&format!("{:?}", elapsed).into());
    let record_batch = record_batch_util::convert(batches);
    set_record_batches(record_batch);

    notify_js_finished_reading(0);
}

#[wasm_bindgen(js_name = "requestChartData")]
pub fn request_chart_data(rest_query: &str) {
    eval_query(get_record_batches().unwrap().batch.clone(), rest_query);
}
