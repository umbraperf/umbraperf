use js_sys::Uint8Array;
use std::io::Result;
use std::io::{Read, Seek, SeekFrom};

use crate::bindings;

pub struct WebFileReader {
    offset: u64,
    length: u64,
}

impl WebFileReader {
    pub fn new_from_file(file_size: i32) -> Self {
        Self {
            offset: 0,
            length: file_size as u64,
        }
    }
}

impl Seek for WebFileReader {
    fn seek(&mut self, pos: SeekFrom) -> Result<u64> {
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

// Read implementation for WebFileReader
impl Read for WebFileReader {
    fn read(&mut self, out: &mut [u8]) -> Result<usize> {
        let array_length = out.len() as u64;
        let read_size = array_length.min(self.length - self.offset);
        if read_size == 0 {
            return Ok(read_size as usize);
        }

        let chunk = bindings::read_file_chunk(self.offset as i32, read_size as i32);
        let len = Uint8Array::byte_length(&chunk);

        if len == array_length as u32 {
            chunk.copy_to(out);
        } else {
            let mut index = 0;
            while index < len {
                out[index as usize] = Uint8Array::get_index(&chunk, index as u32);
                index += 1;
            }
        }

        // Update offset
        self.offset += read_size as u64;
        Ok(read_size as usize)
    }
}
