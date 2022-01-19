// WASM Bindgen
extern crate wasm_bindgen;
use wasm_bindgen::prelude::*;

// Aux
extern crate console_error_panic_hook;

// Arrow
extern crate arrow;
use arrow::record_batch::RecordBatch;

// Reader
mod web_file {
    pub mod parquet_reader;
    pub mod serde_reader;
    pub mod streambuf;
    pub mod web_file_chunkreader;
}

use crate::web_file::serde_reader::SerdeDict;

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
        pub mod statistics;
        pub mod uir;
        pub mod op_mapping;
    }
    pub mod rest {
        pub mod rest_api;
        pub mod rest_api_pars;
    }
}

use exec::rest::rest_api::eval_query;

// Utils
mod utils {
    pub mod bindings;
    pub mod print_to_cons;
    pub mod record_batch_util;
    pub mod string_util;
    pub mod record_batch_schema;
    pub mod array_util;
}

use crate::utils::bindings::notify_js_finished_reading;
use utils::bindings;
use utils::print_to_cons::print_to_js_with_obj;
use utils::record_batch_util;

// State
mod state {
    pub mod state;
}
use crate::state::state::clear_cache;
use crate::state::state::set_file_size;
use crate::state::state::set_unfiltered_record_batch;
use crate::state::state::set_serde_dict;
use state::state::get_unfiltered_record_batch;

// TIMER
fn start_timer() -> instant::Instant {
    instant::Instant::now()
}

fn stop_timer(now: instant::Instant, measured_str: &str) {
    let elapsed = now.elapsed();
    print_to_js_with_obj(&format!("time passed: {:?}, for {:?}", elapsed, measured_str).into());
}

// RECORD_BATCHES
fn init_batches(file_size: i32) -> Vec<RecordBatch> {
    let serde_reader = SerdeDict::read_dict(file_size as u64);
    set_serde_dict(serde_reader);
    set_file_size(file_size as u64);
    record_batch_util::init_record_batches(file_size)
}

fn create_one_record_batch(batches: Vec<RecordBatch>) {
    let record_batch = record_batch_util::convert(batches);
    set_unfiltered_record_batch(record_batch);
}

// JS - RUST FUNCTIONS
#[wasm_bindgen(js_name = "analyzeFile")]
pub fn analyze_file(file_size: i32) {
    clear_cache();
    //let timer = start_timer();
    let batches = init_batches(file_size);
    create_one_record_batch(batches);
    //stop_timer(timer, "file loading");
    notify_js_finished_reading(0);
}

#[wasm_bindgen(js_name = "requestChartData")]
pub fn request_chart_data(rest_query: &str) {
    //let timer = start_timer();
    eval_query(get_unfiltered_record_batch().unwrap().batch.clone(), rest_query);
    //stop_timer(timer, rest_query);
}
