use std::io::Read;

use bytes::Bytes;
use parquet::errors::Result;
use parquet::file::reader::ChunkReader;
use parquet::file::reader::Length;

use super::parquet_reader::BufferReader;
use super::streambuf::WebFileReader;

pub struct WebFileChunkReader {
    length: u64,
}

static PARQUET_FILE_NAME: &str = "samples.parquet";

impl WebFileChunkReader {
    pub fn new(file_size: i32) -> Self {
        BufferReader::read_to_buffer(PARQUET_FILE_NAME, file_size as u64);
        Self {
            length: file_size as u64,
        }
    }
}

impl ChunkReader for WebFileChunkReader {
    type T = BufferReader;

    fn get_read(&self, start: u64) -> Result<BufferReader> {
        let buf_read = BufferReader::set_offset(start);
        Ok(buf_read)
    }

    fn get_bytes(&self, start: u64, length: usize) -> Result<Bytes> {
        let mut buf_read = BufferReader::set_offset(start);
        let mut buffer = vec![0; length];
        buf_read.read_exact(&mut buffer)?;
        Ok(Bytes::from(buffer))
    }

}

impl Length for WebFileChunkReader {
    fn len(&self) -> u64 {
        let mut zip =
            zip::ZipArchive::new(WebFileReader::new_from_file(self.length as i32)).unwrap();
        let reader = zip.by_name(PARQUET_FILE_NAME).unwrap();
        reader.size()
    }
}

impl Clone for WebFileChunkReader {
    fn clone(&self) -> Self {
        Self {
            length: self.length,
        }
}
}