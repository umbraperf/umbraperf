pub(crate) mod csv_reader;

extern crate csv;
extern crate wasm_bindgen;

use csv_reader::example;
use js_sys::Uint8Array;
use wasm_bindgen::prelude::*;
use std::sync::Arc;
use std::sync::Mutex;
use csv::ReaderBuilder;
use std::str;

struct State {
    pub counter: u64,
    pub processed_chunks: u64,
    pub vec: Vec<u8>,
}

thread_local! {
    static STATE: Arc<Mutex<State>> = Arc::new(Mutex::new(State {
        counter: 0,
        processed_chunks: 0, 
        vec: Vec::new(),
    }));
}


#[wasm_bindgen(js_name = "printSomething")]
pub fn print_something(something: &str) {
    example();
}

#[wasm_bindgen(js_name = "getState")]
pub fn get_state() -> i32 {
    STATE.with(|s| {
        let mut sg = s.lock().expect("State unlocked");
        return sg.counter;
        });
    return 0;
}

#[wasm_bindgen(js_name = "getProcessedChunks")]
pub fn get_processed_chunks() -> i32 {
    STATE.with(|s| {
        let mut sg = s.lock().expect("State unlocked");
        return sg.processed_chunks;
        });
    return 0;
}

#[wasm_bindgen(js_name = "consumeChunk")]
pub fn consume_chunk(chunk: &Uint8Array) {
    let _buffer: Vec<u8> = chunk.to_vec();
    let number: u8 = 10;

    let mut linevec = Vec::new();
    let mut iterator = _buffer.iter();

    STATE.with(|s| {
        let mut sg = s.lock().expect("State unlocked");
        if !sg.vec.len().eq(&0) {
            for v in sg.vec.iter() {
                linevec.push(*v);
            }
        }
    });  

    loop {
        match iterator.next() {
            Some(i) => {
                if i == &number {
                    print_to_console(&format!("BINARY: {:?}", &linevec).into());
                    let s = str::from_utf8(&linevec).expect("Invalid UTF-8 sequence.");
                    print_to_console(&format!("STRING: {:?}", &s).into());
                    let mut rdr = ReaderBuilder::new()
                    .delimiter(b',')
                    .has_headers(false)
                    .from_reader(s.as_bytes());
        
                    for result in rdr.records() {
                        let record = result.expect("CSV record");
                        let number = &record[1].parse::<u64>().expect("u64");
                        STATE.with(|s| {
                            let mut sg = s.lock().expect("State unlocked");
                            sg.counter += number;
                            print_to_console(&format!("COUNTER: {:?}", sg.counter).into());
                        }); 
                    }
        
                    linevec = Vec::new(); 
        
                } else {
                   &linevec.push(*i);
                }
            },
            None => { 
                STATE.with(|s| {
                    let mut sg = s.lock().expect("State unlocked");
                    sg.vec = Vec::new();
                    for v in linevec.iter() {
                        sg.vec.push(*v);
                    }
                    sg.processed_chunks += 1;
                }); 
                print_to_console(&format!("Chunk ends and rest of line may be moved to next chunk").into());
                rustfunc();
                break;
             }
        }
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



