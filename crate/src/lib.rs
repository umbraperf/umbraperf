// WASM Bindgen
extern crate wasm_bindgen;
use exec::freq::rel_freq;
use exec::rest::rest_api_pars::rel_freq_pars;
use state::state::get_serde_dict;
use utils::record_batch_util::send_record_batch_to_js;
use wasm_bindgen::prelude::*;

// Aux
extern crate console_error_panic_hook;

// Arrow
extern crate arrow;
use arrow::record_batch::RecordBatch;
use arrow::array::Array;

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
        process_custom_batch_request();
        return;
    }
    eval_query(get_unfiltered_record_batch().unwrap().batch.clone(), rest_query);
    //stop_timer(timer, rest_query);
}

fn process_custom_batch_request() {
    print_to_js_with_obj(&format!("Inside relfreq_csv").into());
    let serde_dict = get_serde_dict().unwrap();
    let batch = &serde_dict.batch;

    // Extract schema and columns
    let schema = batch.schema();
    let num_columns = schema.fields().len();

    // Find the time/bucket column (assuming it's a float column, typically first column)
    let mut bucket_col_idx = 0;

    // Create collections for our results
    let mut buckets = Vec::new();
    let mut categories = Vec::new();
    let mut frequencies = Vec::new();

    // Get unique buckets (assuming first column contains bucket/time values)
    let bucket_array = crate::utils::array_util::get_floatarray_column(batch, bucket_col_idx);
    let mut unique_buckets = Vec::new();
    for i in 0..bucket_array.len() {
        let value = bucket_array.value(i);
        if !unique_buckets.contains(&value) {
            unique_buckets.push(value);
        }
    }
    unique_buckets.sort_by(|a, b| a.partial_cmp(b).unwrap());

    // For each column (except bucket column)
    for col_idx in 1..num_columns {
        let col_name = schema.field(col_idx).name();

        // Get column data
        let col_data = batch.column(col_idx);

        // Process based on column type
        if let Some(string_array) = col_data.as_any().downcast_ref::<arrow::array::StringArray>() {
            // Find unique categories
            let mut unique_categories = Vec::new();
            for i in 0..string_array.len() {
                let value = string_array.value(i);
                if !unique_categories.contains(&value) {
                    unique_categories.push(value);
                }
            }

            // Calculate frequencies for each bucket-category combination
            for &bucket in &unique_buckets {
                let total_in_bucket = bucket_array.iter()
                    .filter(|&x| x == Some(bucket))
                    .count() as f64;

                for &category in &unique_categories {
                    // Count occurrences of this category in this bucket
                    let mut count = 0;
                    for i in 0..batch.num_rows() {
                        if bucket_array.value(i) == bucket &&
                           string_array.value(i) == category {
                            count += 1;
                        }
                    }

                    // Calculate relative frequency
                    let freq = if total_in_bucket > 0.0 {
                        count as f64 / total_in_bucket
                    } else {
                        0.0
                    };

                    // Add to result vectors
                    buckets.push(bucket);
                    categories.push(category);
                    frequencies.push(freq);
                }
            }
        }
        // Add similar blocks for other array types if needed
    }


    let result_batch = create_new_record_batch(
        vec!["bucket", "category", "freq"],
        vec![
            DataType::Float64,
            DataType::Utf8,
            DataType::Float64,
        ],
        vec![
            Arc::new(Float64Array::from(buckets)),
            Arc::new(StringArray::from(categories)),
            Arc::new(Float64Array::from(frequencies)),
        ],
    );

    print_to_js_with_obj(&format!("Result batch: {:?}", result_batch).into());

    send_record_batch_to_js(&result_batch);
}
