use std::io::{Read};

use super::streambuf::WebFileReader;

pub struct ParquetReader {
    offset: u64
}

static mut ARRAY: Vec<u8> = Vec::new();

impl ParquetReader {

    pub fn  read_whole_file(file_size: u64) -> Self {

        let mut zip = zip::ZipArchive::new(WebFileReader::new_from_file(file_size as i32)).unwrap();
        let reader = zip.by_name("samples.parquet").unwrap(); 
        let length = reader.size();
        let start_offset = reader.data_start();
        let web_file_reader = WebFileReader::new_from_file(file_size as i32);
        let mut reader = web_file_reader.set_offset(start_offset as i32);

        let mut offset = 0;
        while offset != length {
            let readsize = (8 * 1024).min(length - offset) as usize;
            let mut vec = vec![0;readsize];
            let _result = reader.read(&mut vec);
            unsafe { 
                ARRAY.append(&mut vec);
            }
            offset = offset + readsize as u64;
        }

        Self {
            offset: 0
        }
    }

    pub fn set_offset(offset: u64) -> Self {
        Self {
            offset: offset
        }
    }
}

impl Read for ParquetReader {


    fn read(&mut self, buf: &mut [u8]) -> std::io::Result<usize> {

        let read_size = buf.len();
        
        unsafe {
            buf.clone_from_slice(&ARRAY[self.offset as usize .. (self.offset as usize) + read_size]);
        }

        self.offset = self.offset + (read_size as u64);

        Ok(read_size)
    }
}
