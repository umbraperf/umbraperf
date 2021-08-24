use wasm_bindgen::prelude::*;
use js_sys::{Uint8Array};

// WASM_BINDGEN
#[wasm_bindgen(raw_module = "../../src/worker")]
extern "C" { 

    #[wasm_bindgen(js_name = "readFileChunk")]
    pub fn read_file_chunk(offset: i32, bytes: i32) -> Uint8Array;

    #[wasm_bindgen(js_name = "storeEventsFromRust")]
    pub fn send_events_to_js(events_results: Vec<i32>);

    #[wasm_bindgen(js_name = "stroreArrowResultFromRust")]
    pub fn send_arrow_result_to_js(arrow_result: Vec<u8>);


}