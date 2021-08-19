use wasm_bindgen::prelude::*;
use js_sys::{Array, Uint8Array};

// WASM_BINDGEN
#[wasm_bindgen(raw_module = "../../src/worker")]
extern "C" { 

    #[wasm_bindgen(js_name = "readFileChunk")]
    pub fn read_file_chunk(offset: i32, bytes: i32) -> Uint8Array;

    #[wasm_bindgen(js_name = "stroreResultFromRust")]
    pub fn store_result_from_rust(result: i32, request_id: i32);

    #[wasm_bindgen(js_name = "stroreArrowResultFromRust")]
    pub fn store_arrow_result_from_rust(arrow_result: Vec<u8>);


}