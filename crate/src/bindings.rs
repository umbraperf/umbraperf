use wasm_bindgen::prelude::*;

// WASM_BINDGEN 
#[wasm_bindgen(raw_module = "../../src/worker")]
extern "C" {

    #[wasm_bindgen(js_name="readFileChunk")]
    pub fn read_file_chunk(offset: i32, bytes: i32) -> i32;

}