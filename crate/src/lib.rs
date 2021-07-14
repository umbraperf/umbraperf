extern crate wasm_bindgen;

use js_sys::Uint8Array;
use wasm_bindgen::prelude::*;
use std::sync::Arc;
use std::sync::Mutex;
use csv::ReaderBuilder;
use std::str;

struct State {
    pub vec: Vec<u8>,
    pub processed_chunks: i32,
    pub expected_chunks: i32
}

thread_local! {
    static STATE: Arc<Mutex<State>> = Arc::new(Mutex::new(State {
        vec: Vec::new(),
        processed_chunks: 0,
        expected_chunks: 0
    }));
}

static mut COUNTER: i32 = 0;


#[wasm_bindgen(js_name = "getState")]
pub fn get_state() -> i32 {
    unsafe {
        return COUNTER;
    }
}

#[wasm_bindgen(js_name = "setExpectedChunks")]
pub fn set_expected_chunks(expected_chunks: i32) -> i32 {
    STATE.with(|s| {
        let mut sg = s.lock().expect("State unlocked");
        sg.expected_chunks = expected_chunks;
        });
    return 0;
}


#[wasm_bindgen(js_name = "consumeChunk")]
pub fn consume_chunk(chunk: &Uint8Array) {
    let _buffer: Vec<u8> = chunk.to_vec();
    let linebreak: u8 = 10;

    let mut linevec = Vec::new();
    let mut iterator = _buffer.iter();

    STATE.with(|s| {
        let sg = s.lock().expect("State unlocked");
        if !sg.vec.len().eq(&0) {
            for v in sg.vec.iter() {
                linevec.push(*v);
            }
        }
    });  

    // loop through buffer
    loop {
        match iterator.next() {
            Some(i) => {
                // if linebreak is found process vector else push it to vector for later use
                if i == &linebreak {
                    process_chunk(linevec);
                    linevec = Vec::new(); 
        
                } else {
                   &linevec.push(*i);
                }
            },
            None => { 
                STATE.with(|s| {
                    let mut sg = s.lock().expect("State unlocked");
                    sg.processed_chunks += 1;
                    if sg.expected_chunks == sg.processed_chunks {
                        if linevec.len() > 0 {
                            process_chunk(linevec);
                        }
                        rustfunc();
                        unsafe {
                            COUNTER = 0;
                        }
                        sg.processed_chunks = 0;
                        sg.vec = Vec::new();
                    } else {
                        sg.vec = Vec::new();
                        for v in linevec.iter() {
                            sg.vec.push(*v);
                        }
                    }
                }); 
                print_to_console(&format!("Chunk ends and rest of line may be moved to next chunk").into());
                break;
             }
        }
    }
}

pub fn process_chunk(vec: Vec<u8>) {

    print_to_console(&format!("BINARY: {:?}", &vec).into());
    let s = str::from_utf8(&vec).expect("Invalid UTF-8 sequence.");
    print_to_console(&format!("STRING: {:?}", &s).into());
    let mut rdr = ReaderBuilder::new()
    .delimiter(b',')
    .has_headers(false)
    .from_reader(s.as_bytes());

    for result in rdr.records() {
        let record = result.expect("CSV record");
        let number = &record[1].parse::<i32>().expect("u64");
        unsafe {
            COUNTER = COUNTER + number;
        }
    }
    unsafe {
        print_to_console(&format!("COUNTER: {:?}", COUNTER).into());
    }

}

pub fn print_to_console(str: &JsValue) {
    unsafe {
        web_sys::console::log_1(str);
    }
}

#[wasm_bindgen]
pub fn rustfunc() {
    unsafe {
        update();
    }
}

#[wasm_bindgen(raw_module="../../src/dummy")]
extern "C" {
    #[wasm_bindgen()]
    fn update() -> u32;
}