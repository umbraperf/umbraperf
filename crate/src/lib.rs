use wasm_bindgen::prelude::*;

#[wasm_bindgen(js_name = "printSomething")]
pub fn print_something(something: &str) {
    web_sys::console::log_1(&something.into());
}

#[wasm_bindgen(start)]
pub fn main() {
    //console_error_panic_hook::set_once();
}
