extern crate wasm_bindgen;

use arrow::array::UInt16Array;
use csv::ReaderBuilder;
use futures::*;
use js_sys::{Uint8Array, JSON};
use std::cell::RefCell;
use std::io::Cursor;
use std::{io, str};
use wasm_bindgen::prelude::*;

extern crate arrow;
use arrow::*;
use js_sys::Promise as js_promise;
use std::fs::File;
use std::io::Error;
use arrow::array::*;
use arrow::record_batch::RecordBatch;




extern crate console_error_panic_hook;
use std::panic;

use arrow::datatypes::{DataType, Field, Schema};
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

/* fn createBuilder(chunk: &Uint8Array) -> a::reader::Reader<Cursor<Vec<u8>>> {

    let buff = Cursor::new(chunk.to_vec());

    //let file = File::open("test/data/uk_cities_with_headers.csv").unwrap();

    let schema = Schema::new(vec![
        Field::new("Test", DataType::Int64, false)

    ]);

    let reader = a::reader::Reader::new(buff, Arc::new(schema), false, None, 1000, None, None);


    // create a builder, inferring the schema with the first 100 records

    //let builder:a::reader::ReaderBuilder = a::reader::ReaderBuilder::new().infer_schema(Some(100));

    //builder.has_headers(true);
    //builder.with_deliminator(',');
    //builder.with_batch_size(4000);

    //let reader = builder.build(buff.seek()).unwrap();

    print_to_console(&format!("Hey, went into apache arrow reader").into());

    reader
} */

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
    let array = read_chunk(&p).await?;
    unsafe { web_sys::console::log_1(&format!("HERE TO PRINT").into()) };
    unsafe { web_sys::console::log_1(&array) };
    unsafe { web_sys::console::log_1(&format!("HERE TO PRINT2").into()) };
    unsafe { web_sys::console::log_1(&format!("{:?}",&array).into()) };
    unsafe { web_sys::console::log_1(&format!("HERE TO PRINT3").into()) };

    let mut buff = Cursor::new(array);
    /* let arr = arrow::bytes::Bytes::new(array);
    let buff2 = arrow::buffer::Buffer::from_bytes(array.to_vec());
     */
    let id_array = arrow::array::UInt8Array::from(vec![1, 2, 3, 4, 5]);
    
    let schema = Schema::new(vec![
    Field::new("id", DataType::UInt8, false)
    ]);

    let batch = RecordBatch::try_new(
        Arc::new(schema),
        vec![Arc::new(id_array)]
    );
    
    Ok(())
}

async fn read_chunk(p: &Web_File) -> Result<Uint8Array, js_sys::Error> {
    let x:i32 = 6000;
    let y:i32 = 9000;
    let x = p.ask_js_for_chunk(x, y).await?.into();  
    unsafe { web_sys::console::log_1(&format!("HERE2").into()) };
    unsafe { web_sys::console::log_1(&format!("{:?}",&x).into()) };
    Ok(x)
}

#[wasm_bindgen(raw_module = "../../src/model/web_file", js_name="web_file")]
extern "C" {

    #[wasm_bindgen(js_name = "WebFile")]
    pub type Web_File;

    #[wasm_bindgen(method,catch, js_name = "askJsForChunk")]
    async fn ask_js_for_chunk(this: &Web_File, offset: i32, chunkSize: i32) -> Result<JsValue, JsValue>;
}

#[wasm_bindgen(start)]
pub fn main() {
    console_error_panic_hook::set_once();
    // log::set_logger(&DEFAULT_LOGGER).unwrap();
    // log::set_max_level(log::LevelFilter::Info);
}
