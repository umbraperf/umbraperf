// WASM Bindgen
extern crate wasm_bindgen;
use std::sync::Arc;

use arrow::array::{Float64Array, StringArray, Array};
use arrow::datatypes::DataType;
use arrow::record_batch::RecordBatch;
use exec::rest::rest_api_pars::rel_freq_pars;
use state::state::get_serde_dict;
use utils::record_batch_util::send_record_batch_to_js;
use wasm_bindgen::prelude::*;

// Aux
extern crate console_error_panic_hook;

// Arrow
extern crate arrow;

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
    if rest_query.starts_with("relfreq_csv") {
        process_custom_batch_request(rest_query);
        return;
    }
    eval_query(get_unfiltered_record_batch().unwrap().batch.clone(), rest_query);
    //stop_timer(timer, rest_query);
}

fn process_custom_batch_request(rest_query: &str) {
    print_to_js_with_obj(&format!("Inside relfreq_csv").into());
    let serde_dict = get_serde_dict().unwrap();
    let batch = &serde_dict.batch;

    let time_filter = {
        let parts: Vec<&str> = rest_query.split('?').collect();
        if parts.len() > 1 {
            parts[1].to_string()
        } else {
            "".to_string()
        }
    };

    // Parse time filter if it exists
    let (start_time, end_time) = parse_time_filter(&time_filter);
    print_to_js_with_obj(&format!("Time filter: start={:?}, end={:?}", start_time, end_time).into());

    // Extract schema and columns
    let schema = batch.schema();
    let num_columns = schema.fields().len();

    // Find the time/bucket column (assuming it's a float column, typically first column)
    let mut bucket_col_idx = 0;

    // Create collections for our results
    let mut buckets = Vec::new();
    let mut categories = Vec::new();
    let mut frequencies = Vec::new();

    // Get the first bucket value to use as reference
    let first_bucket = if batch.num_rows() > 0 {
        batch.column(bucket_col_idx).as_any().downcast_ref::<arrow::array::Float64Array>().unwrap().value(0)
    } else {
        0.0
    };

    // Iterate over the record batch
    for i in 0..batch.num_rows() {
        let raw_bucket = batch.column(bucket_col_idx).as_any().downcast_ref::<arrow::array::Float64Array>().unwrap().value(i);
        let bucket = (raw_bucket - first_bucket) / 1000.0 / 1000.0;

        // Apply time filter if it exists
        if let (Some(start), Some(end)) = (start_time, end_time) {
            if bucket < start || bucket > end {
                continue; // Skip this row if outside the time range
            }
        }

        // each column is a category
        for j in 1..num_columns {
            let category = schema.field(j).name();
            let freq = batch.column(j).as_any().downcast_ref::<arrow::array::Float64Array>().unwrap().value(i);
            buckets.push(bucket);
            categories.push(category.to_string());
            frequencies.push(freq);
        }
    }

    let result_batch = RecordBatch::try_new(
        Arc::new(arrow::datatypes::Schema::new(vec![
            arrow::datatypes::Field::new("bucket", DataType::Float64, false),
            arrow::datatypes::Field::new("category", DataType::Utf8, false),
            arrow::datatypes::Field::new("freq", DataType::Float64, false),
        ])),
        vec![
            Arc::new(Float64Array::from(buckets)),
            Arc::new(StringArray::from(categories)),
            Arc::new(Float64Array::from(frequencies)),
        ],
    ).unwrap();

    print_to_js_with_obj(&format!("Result batch: {:?}", result_batch).into());

    send_record_batch_to_js(&result_batch);
}

// Helper function to parse time filter
fn parse_time_filter(filter: &str) -> (Option<f64>, Option<f64>) {
    if filter.is_empty() || filter == "-1from_to-1" {
        return (None, None); // No filtering
    }

    if let Some(from_to_idx) = filter.find("from_to") {
        let start_str = &filter[0..from_to_idx];
        let end_str = &filter[from_to_idx + "from_to".len()..];

        let start = start_str.parse::<f64>().ok();
        let end = end_str.parse::<f64>().ok();

        return (start, end);
    }

    (None, None)
}
