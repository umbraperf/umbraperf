use wasm_bindgen::JsValue;

// print_to_cons::print_to_js_with_obj(&format!("{:?}", ).into());
pub fn print_to_js_with_obj(s: &JsValue) {
    use web_sys::console;
    console::log_1(s);
}
