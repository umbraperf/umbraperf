use parquet::file::reader::ChunkReader;
use parquet::file::reader::Length;
use parquet::errors::Result;

use super::streambuf::WebFileReader;
use super::parquet_reader::ParquetReader;


pub struct WebFileChunkReader {
    length: u64
}

impl WebFileChunkReader {
    pub fn new(file_size: i32) -> Self {
        
        ParquetReader::read_whole_file(file_size as u64);
        Self {
            length: file_size as u64
        }
    }
}

impl ChunkReader for WebFileChunkReader {
    type T = ParquetReader;

    fn get_read(&self, start: u64, length: usize) -> Result<ParquetReader> {

        let buf_read = ParquetReader::set_offset(start);
        Ok(buf_read)
    }
}

impl Length for WebFileChunkReader {
    fn len(&self) -> u64 {
        let mut zip = zip::ZipArchive::new(WebFileReader::new_from_file(self.length as i32)).unwrap();
        let reader = zip.by_name("samples.parquet").unwrap(); 
        reader.size()
    }
}