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
}

use utils::bindings;
use utils::record_batch_util;
use utils::print_to_cons::print_to_js_with_obj;
use crate::utils::bindings::notify_js_finished_reading;

// State
mod state {
    pub mod state;
}
use crate::state::state::clear_cache;
use crate::state::state::set_file_size;
use crate::state::state::set_record_batches;
use crate::state::state::set_serde_dict;
use state::state::get_record_batches;


// TIMER
fn start_timer() -> instant::Instant {
    instant::Instant::now()
}

fn stop_timer(now: instant::Instant) {
    let elapsed = now.elapsed();
    print_to_js_with_obj(&format!("{:?}", elapsed).into());
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
    set_record_batches(record_batch);
}

// JS - RUST FUNCTIONS
#[wasm_bindgen(js_name = "analyzeFile")]
pub fn analyze_file(file_size: i32) {
    clear_cache();
    let timer = start_timer();
    let batches = init_batches(file_size);
    stop_timer(timer);
    create_one_record_batch(batches);
    notify_js_finished_reading(0);
}

#[wasm_bindgen(js_name = "requestChartData")]
pub fn request_chart_data(rest_query: &str) {
    eval_query(get_record_batches().unwrap().batch.clone(), rest_query);
}
