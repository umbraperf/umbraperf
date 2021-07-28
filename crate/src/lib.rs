extern crate wasm_bindgen;
use wasm_bindgen::prelude::*;

use js_sys::{Uint8Array};

use std::sync::Arc;
use std::cell::RefCell;
use std::io::{BufRead};
use std::{io};
use std::panic;

extern crate arrow;
use arrow::array::Array;

extern crate console_error_panic_hook;

mod console;
mod console_js_log;

//STATE
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


// STATE ACCESS
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

pub fn get_state() -> i32 {
    with_state(|s| s.sum)
}

pub fn set_expected_chunks(expected_chunks: i32) -> i32 {
    with_state_mut(|s| {
        s.expected_chunks = expected_chunks;
    });
    return 0;
}

// START
#[wasm_bindgen(js_name = "triggerScanFile")]
pub async fn scan_file(p: Web_File) -> Result<(), js_sys::Error> {
    
    print_to_js("Scan File triggered");

    // Size and starting point of chunk reading
    let mut from: i32 = 0;
    let size: i32 = 4000;

    loop {
        let array = read_chunk(&p, from, size).await?;
        print_to_js_with_obj(&array);

        if array.to_vec().len() == 0 {
            print_to_js("End of File");
            return Ok(())
        } else {
            print_to_js("Chunk is processed to Batch");

            let mut cursor = io::Cursor::new(array.to_vec());
            let mut buf = vec![];

            loop {
                let len_buf = buf.len();
                let read = cursor.read_until(b'\n', &mut buf);
                if len_buf == buf.len() {
                    break;
                }
                print_to_js_with_obj(&format!("{:?}",&buf).into());

                match read {
                    Err(x) => {
                        print_to_js_with_obj(&format!("Error reading (cursor)").into());
                    }
                    Ok(_x) => {
                    }
                }
            
            }
           
            let arrow_reader_builder = arrow::csv::reader::ReaderBuilder::new();
            let cursor_reader =  arrow::csv::reader::ReaderBuilder::build(arrow_reader_builder,io::Cursor::new(buf));
            let mut reader = cursor_reader.unwrap();
             
            print_to_js("Reader is build");

            let batch = &reader.next().unwrap().unwrap();
            let column = batch.column(0);
            aggregate_batch_column(column);
            
            print_to_js_with_obj(&format!("{:?}", &batch).into());
            from += size;
        }
    }
}

async fn read_chunk(p: &Web_File, from: i32, to: i32) -> Result<Uint8Array, js_sys::Error> {

    let name: &str = "Test-Name";
    let _result_of_computation = p.store_result_from_rust(name.into(), vec![1,2,3]);
    let array = p.ask_js_for_chunk(from, to).await?.into();  
    
    print_to_js("Print js-chunk");
    print_to_js_with_obj(&format!("{:?}",&array).into());
    Ok(array)
}

// TODO Aggreate and Sum Functions
fn aggregate_batch_column(_array: &Arc<dyn Array>) -> i64 {
    0
}

// PRINTING
fn print_to_js(s: &str) {
    use web_sys::console;
    unsafe { console::log_1(&format!("{}", s).into()); }
}

fn print_to_js_with_obj(s: &JsValue) {
    use web_sys::console;
    unsafe { console::log_1(s); }
}


// WASM_BINDGEN 
#[wasm_bindgen(raw_module = "../../src/model/web_file", js_name="web_file")]
extern "C" {

    #[wasm_bindgen(js_name = "WebFile")]
    pub type Web_File;

    #[wasm_bindgen(method,catch, js_name = "askJsForChunk")]
    async fn ask_js_for_chunk(this: &Web_File, offset: i32, chunkSize: i32) -> Result<JsValue, JsValue>;

    #[wasm_bindgen(method,catch, js_name = "storeResultFromRust")]
    fn store_result_from_rust(this: &Web_File, request: String, x: Vec<i32>) -> Result<JsValue, JsValue>;

}
