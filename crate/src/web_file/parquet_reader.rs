use std::{io::Read};

use crate::state::{append_to_parquet_file_binary, get_parquet_file_binary};

use super::streambuf::WebFileReader;

pub struct ParquetReader {
    offset: u64,
}

static PARQUET_FILE_NAME: &str = "samples.parquet";

impl ParquetReader {
    pub fn read_parquet(file_size: u64) -> Self {
        let mut zip = zip::ZipArchive::new(WebFileReader::new_from_file(file_size as i32)).unwrap();
        let reader = zip.by_name(PARQUET_FILE_NAME).unwrap();
        let length = reader.size();
        let start_offset = reader.data_start();
        let web_file_reader = WebFileReader::new_from_file(file_size as i32);
        let mut reader = web_file_reader.set_offset(start_offset as i32);

        let mut offset = 0;
        while offset != length {
            let readsize = (8 * 1024).min(length - offset) as usize;
            let mut vec = vec![0; readsize];
            let _result = reader.read(&mut vec);
            append_to_parquet_file_binary(vec);
            offset = offset + readsize as u64;
        }

        Self { offset: 0 }
    }

    pub fn set_offset(offset: u64) -> Self {
        Self { offset: offset }
    }
}

impl Read for ParquetReader {
    fn read(&mut self, buf: &mut [u8]) -> std::io::Result<usize> {
        let read_size = buf.len();

        let parquet_file = get_parquet_file_binary();
        let binary = parquet_file.lock().unwrap();

        buf.clone_from_slice(&binary[self.offset as usize..(self.offset as usize) + read_size]);

        self.offset = self.offset + (read_size as u64);

        Ok(read_size)
    }
}
