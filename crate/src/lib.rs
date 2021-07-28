extern crate wasm_bindgen;

use arrow::array::Array;
use js_sys::{Uint8Array};
use std::cell::RefCell;
use std::io::{BufRead, Read};
use std::{io};
use wasm_bindgen::prelude::*;

extern crate arrow;
use arrow::datatypes::{DataType, Field, Schema};


extern crate console_error_panic_hook;
use std::panic;

use std::sync::Arc;

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

pub fn get_state() -> i32 {
    with_state(|s| s.sum)
}

pub fn set_expected_chunks(expected_chunks: i32) -> i32 {
    with_state_mut(|s| {
        s.expected_chunks = expected_chunks;
    });
    return 0;
}


#[wasm_bindgen(js_name = "triggerScanFile")]
pub async fn scan_file(p: Web_File) -> Result<(), js_sys::Error> {
    let result_of_computation = p.store_result_from_rust("parquet".into(), vec![1,2,3]);

    
    unsafe { web_sys::console::log_1(&format!("Scan File triggered").into()) };
    let mut from: i32 = 0;
    let size: i32 = 5;
    loop {
        unsafe { web_sys::console::log_1(&format!("{:?}", &from).into()) };
        unsafe { web_sys::console::log_1(&format!("{:?}", &size).into()) };
        let array = read_chunk(&p, from, size).await?;
        unsafe { web_sys::console::log_1(&array) };
        if array.to_vec().len() == 0 {
            unsafe { web_sys::console::log_1(&format!("End of File").into()) };
            return Ok(())
        } else {

            unsafe { web_sys::console::log_1(&format!("Chunk is processed to Batch").into()) };


            let mut cursor = io::Cursor::new(array.to_vec());
            let mut buf = vec![];

            loop {
                let len_buf = buf.len();
                let read = cursor.read_until(b'\n', &mut buf);
                if len_buf == buf.len() {
                    break;
                }
                unsafe { web_sys::console::log_1(&format!("{:?}",&buf).into()) };

                match read {
                    Err(x) => {
                        unsafe { web_sys::console::log_1(&format!("Error reading (cursor)").into()) };
                    }
                    Ok(_x) => {
    
                    }
                }
            
            }
           
            let arrow_reader_builder = arrow::csv::reader::ReaderBuilder::new();
            let cursor_reader =  arrow::csv::reader::ReaderBuilder::build(arrow_reader_builder,io::Cursor::new(buf));
            let mut reader = cursor_reader.unwrap();
             
            unsafe { web_sys::console::log_1(&format!("Reader is build").into()) };

            let batch = &reader.next().unwrap().unwrap();
            let column = batch.column(0);
            aggregate_batch_column(column);
            
            unsafe { web_sys::console::log_1(&format!("{:?}", &batch).into()) };
            from += size;
        }
    }
}

//TODO
fn aggregate_batch_column(array: &Arc<dyn Array>) -> i64 {
    0
}

async fn read_chunk(p: &Web_File, from: i32, to: i32) -> Result<Uint8Array, js_sys::Error> {
    let s: &str = "t";
    let array = p.ask_js_for_chunk(from, to).await?.into();  
    unsafe { web_sys::console::log_1(&format!("Print js-chunk").into()) };
    unsafe { web_sys::console::log_1(&format!("{:?}",&array).into()) };
    Ok(array)
}

#[wasm_bindgen(raw_module = "../../src/model/web_file", js_name="web_file")]
extern "C" {

    #[wasm_bindgen(js_name = "WebFile")]
    pub type Web_File;

    #[wasm_bindgen(method,catch, js_name = "askJsForChunk")]
    async fn ask_js_for_chunk(this: &Web_File, offset: i32, chunkSize: i32) -> Result<JsValue, JsValue>;

    #[wasm_bindgen(method,catch, js_name = "storeResultFromRust")]
    fn store_result_from_rust(this: &Web_File, request: String, x: Vec<i32>) -> Result<JsValue, JsValue>;
}

#[wasm_bindgen(start)]
pub fn main() {
    console_error_panic_hook::set_once();
    // log::set_logger(&DEFAULT_LOGGER).unwrap();
    // log::set_max_level(log::LevelFilter::Info);
}
