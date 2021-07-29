use wasm_bindgen::prelude::*;

// WASM_BINDGEN 
#[wasm_bindgen(raw_module = "../../src/model/web_file", js_name="web_file")]
extern "C" {

    #[wasm_bindgen(js_name = "WebFile")]
    pub type WebFile;

    #[wasm_bindgen(method, catch, js_name = "askJsForChunk")]
    pub async fn ask_js_for_chunk(this: &WebFile, offset: i32, bytes: i32) -> Result<JsValue, JsValue>;

    #[wasm_bindgen(method, catch, js_name = "storeResultFromRust")]
    pub fn store_result_from_rust(this: &WebFile, request: String, x: Vec<i32>) -> Result<JsValue, JsValue>;

    #[wasm_bindgen(method, js_name = "getLength")]
    pub fn length(this: &WebFile) -> u64;
}