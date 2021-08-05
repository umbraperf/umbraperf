
use std::io::{Seek, SeekFrom, Read};
use std::io::Result;
use js_sys::Uint8Array;
use wasm_bindgen::prelude::*;

use crate::bindings;

pub struct WebFileReader {
    offset: u64,
    length: u64,
}

impl WebFileReader {
    pub fn new_from_file(file_size: i32) -> Self {
        print_to_js("LLLLLLEENGHT");
        print_to_js_with_obj(&format!("{:?}", &file_size).into());
        Self {
            offset: 0,
            length: file_size as u64
        }
    }
}

impl Seek for WebFileReader {
    // XXX Fix negative offsets
    fn seek(&mut self, pos: SeekFrom) -> Result<u64> {
        print_to_js("I'am Seeking");
        self.offset = match pos {
            SeekFrom::Current(ofs) => self.offset + (self.length - self.offset).min(ofs as u64),
            SeekFrom::Start(ofs) => self.length.min(ofs as u64),
            SeekFrom::End(ofs) => self.length - self.length.min(ofs as u64),
        };
        Ok(self.offset)
    }

    fn stream_position(&mut self) -> std::io::Result<u64> {
        Ok(self.offset)
    }
}


impl Read for WebFileReader {
    fn read(&mut self, out: &mut [u8]) -> Result<usize> {
        
        let array_length = out.len() as u64;
        let read_size = array_length.min(self.length - self.offset);
        if read_size == 0 {
            return Ok(read_size as usize)
        }
        print_to_js("READ_SIZE");
        print_to_js(&read_size.to_string());

        let left_to_read = self.length - read_size;

        
        let uint8array = bindings::read_file_chunk(self.offset as i32,read_size as i32);
        
        let mut counter = 0;
        
        let length = Uint8Array::byte_length(&uint8array);

        print_to_js("LENGTH");
        print_to_js_with_obj(&format!("{:?}", &length).into()); 

        while counter < length {
            out[counter as usize] = Uint8Array::get_index(&uint8array,counter as u32);
           /*  print_to_js(&out[*&counter as usize].to_string());
            print_to_js_with_obj(&format!("{:?}", &out).into());  */
            counter += 1;
        }

/*         print_to_js_with_obj(&format!("{:?}", &out).into()); 
 */        
        self.offset += read_size as u64;
       
        Ok(read_size as usize)
    }
}

fn print_to_js(s: &str) {
    use web_sys::console;
    unsafe { console::log_1(&format!("{}", s).into()); }
}

fn print_to_js_with_obj(s: &JsValue) {
    use web_sys::console;
    unsafe { console::log_1(s); }
}