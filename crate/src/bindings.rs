use wasm_bindgen::prelude::*;
use js_sys::Uint8Array;

// WASM_BINDGEN
#[wasm_bindgen(raw_module = "../../src/worker")]
extern "C" {

    #[wasm_bindgen(js_name = "readFileChunk")]
    pub fn read_file_chunk(offset: i32, bytes: i32) -> Uint8Array;

}

pub fn binding_read_chunk_from_js(offset: i32, bytes: i32) -> Uint8Array {
    return read_file_chunk(offset, bytes);
}
