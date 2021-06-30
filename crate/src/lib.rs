use js_sys::Uint8Array;
use wasm_bindgen::prelude::*;
use std::sync::Arc;
use std::sync::{Mutex, MutexGuard};

struct State {
    pub counter: u64,
}

thread_local! {
    static STATE: Arc<Mutex<State>> = Arc::new(Mutex::new(State {
        counter: 0,
    }));
}


#[wasm_bindgen(js_name = "printSomething")]
pub fn print_something(something: &str) {
    web_sys::console::log_1(&something.into());
}


#[wasm_bindgen(js_name = "consumeChunk")]
pub fn consume_chunk(chunk: &Uint8Array) {
    let buffer = chunk.to_vec();
    STATE.with(|s| {
        let mut sg = s.lock().unwrap();
        sg.counter += 1;
        web_sys::console::log_1(&format!("received chunk: {}", sg.counter).into());
    });
}

#[wasm_bindgen(start)]
pub fn main() {
    //console_error_panic_hook::set_once();
}
