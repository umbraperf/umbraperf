// Wasm Bindgen
extern crate wasm_bindgen;
use exec::rest::rest_api::eval_query;
use state::state::get_record_batches;
use utils::print_to_cons::print_to_js_with_obj;
use wasm_bindgen::prelude::*;

// Aux
extern crate console_error_panic_hook;

// Arrow
extern crate arrow;

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

mod state {
    pub mod state;
}

use crate::state::state::clear_cache;
use crate::state::state::set_record_batches;
use crate::state::state::set_serde_dict;
use crate::utils::bindings::notify_js_finished_reading;
use crate::web_file::serde_reader::SerdeDict;
use utils::bindings;
use utils::record_batch_util;


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
