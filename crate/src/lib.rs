extern crate wasm_bindgen;

use csv::ReaderBuilder;
use js_sys::Uint8Array;
use std::cell::RefCell;
use std::str;
use wasm_bindgen::prelude::*;

extern crate console_error_panic_hook;
use std::panic;

mod console;

pub struct State {
    pub vec: Vec<u8>,
    pub processed_chunks: i32,
    pub expected_chunks: i32,
    pub sum: i32,
}

thread_local! {
    static STATE: RefCell<State> = RefCell::new(State {
        vec: Vec::new(),
        processed_chunks: 0,
        expected_chunks: 0,
        sum: 0,
    });
}

fn with_state<Callback, ReturnType>(cb: Callback) -> ReturnType
where
    Callback: FnOnce(&State) -> ReturnType,
{
    STATE.with(|s| cb(&s.borrow()))
}

fn with_state_mut<Callback, ReturnType>(cb: Callback) -> ReturnType
where
    Callback: FnOnce(&mut State) -> ReturnType,
{
    STATE.with(|s| cb(&mut s.borrow_mut()))
}

#[wasm_bindgen(js_name = "getState")]
pub fn get_state() -> i32 {
    with_state(|s| s.sum)
}

#[wasm_bindgen(js_name = "setExpectedChunks")]
pub fn set_expected_chunks(expected_chunks: i32) -> i32 {
    with_state_mut(|s| {
        s.expected_chunks = expected_chunks;
    });
    return 0;
}

#[wasm_bindgen(js_name = "consumeChunk")]
pub fn consume_chunk(chunk: &Uint8Array) {
    let buffer: Vec<u8> = chunk.to_vec();
    let linebreak: u8 = 10;

    let mut binary_vec = Vec::new();
    let mut iterator = buffer.iter();

    with_state_mut(|s| {
        if s.vec.len() > 0 {
            for v in s.vec.iter() {
                binary_vec.push(*v);
            }
        }
    });

    // loop through buffer
    loop {
        match iterator.next() {
            Some(i) => {
                // if linebreak is found process binary vector else push it to vector for later processing
                if i == &linebreak {
                    with_state_mut(|sg| {
                        process_chunk(sg, binary_vec);
                    });
                    binary_vec = Vec::new();
                } else {
                    &binary_vec.push(*i);
                }
            }
            // may be end of file or end of chunk
            None => {
                let done = with_state_mut(|sg| {
                    sg.processed_chunks += 1;
                    // end of file
                    if sg.expected_chunks == sg.processed_chunks {
                        if binary_vec.len() > 0 {
                            process_chunk(sg, binary_vec);
                        }
                        sg.processed_chunks = 0;
                        sg.sum = 0;
                        sg.vec = Vec::new();
                        return true;
                    // end of chunk
                    } else {
                        // push line break of chunk to global state
                        sg.vec = Vec::new();
                        for v in binary_vec.iter() {
                            sg.vec.push(*v);
                        }
                        print_to_console(&format!("Chunk ends").into());
                        return false;
                    }
                });
                if done {
                    // notify JS about finish and reset variables and notify JS about finish
                    notifyJS();
                    print_to_console(&format!("File ends").into());
                }
                break;
            }
        }
    }
}

pub fn process_chunk(state: &mut State, vec: Vec<u8>) {
    // convert to String
    let s = str::from_utf8(&vec).expect("Invalid UTF-8 sequence.");
    // reader
    let mut rdr = ReaderBuilder::new()
        .delimiter(b',')
        .has_headers(false)
        .from_reader(s.as_bytes());

    // calculate
    for result in rdr.records() {
        let record = result.expect("CSV record");
        let number = &record[1].parse::<i32>().expect("u64");

        state.sum = state.sum + number;
        print_to_console(&format!("COUNTER: {:?}", state.sum).into());
    }
    print_to_console(&format!("BINARY: {:?}", &vec).into());
    print_to_console(&format!("STRING: {:?}", &s).into());
}

pub fn print_to_console(str: &JsValue) {
    unsafe { web_sys::console::log_1(str) };
}

#[wasm_bindgen]
pub fn notifyJS() {
    unsafe { update() };
}

#[wasm_bindgen(raw_module = "../../src/componentes/dummy")]
extern "C" {
    #[wasm_bindgen()]
    fn update() -> u32;
}

#[wasm_bindgen(start)]
pub fn main() {
    console_error_panic_hook::set_once();
    // log::set_logger(&DEFAULT_LOGGER).unwrap();
    // log::set_max_level(log::LevelFilter::Info);
}
