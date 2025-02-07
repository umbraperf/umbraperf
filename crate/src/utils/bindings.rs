use js_sys::Uint8Array;
use wasm_bindgen::prelude::*;

// Connection between Rust and JavaScript
#[wasm_bindgen(raw_module = "../../src/worker.ts")]
extern "C" {

    #[wasm_bindgen(js_name = "readFileChunk")]
    pub fn read_file_chunk(offset: i32, bytes: i32) -> Uint8Array;

    #[wasm_bindgen(js_name = "notifyJsFinishedReading")]
    pub fn notify_js_finished_reading(request_id: i32);

    #[wasm_bindgen(js_name = "sendJsQueryResult")]
    pub fn send_js_query_result(query_result: Vec<u8>);

    #[wasm_bindgen(js_name = "notifyJsQueryPlan")]
    pub fn send_js_query_plan(query_plan: String);

    #[wasm_bindgen(js_name = "stroreArrowResultFromRust")]
    pub fn send_arrow_result_to_js(arrow_result: Vec<u8>);

}
