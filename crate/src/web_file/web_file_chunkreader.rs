use parquet::errors::Result;
use parquet::file::reader::ChunkReader;
use parquet::file::reader::Length;

use super::parquet_reader::ParquetReader;
use super::streambuf::WebFileReader;

pub struct WebFileChunkReader {
    length: u64,
}

impl WebFileChunkReader {
    pub fn new(file_size: i32) -> Self {
        ParquetReader::read_parquet(file_size as u64);
        Self {
            length: file_size as u64,
        }
    }
}

impl ChunkReader for WebFileChunkReader {
    type T = ParquetReader;

    fn get_read(&self, start: u64, _length: usize) -> Result<ParquetReader> {
        let buf_read = ParquetReader::set_offset(start);
        Ok(buf_read)
    }
}

impl Length for WebFileChunkReader {
    fn len(&self) -> u64 {
        let mut zip =
            zip::ZipArchive::new(WebFileReader::new_from_file(self.length as i32)).unwrap();
        const PARQUET_FILE_NAME: &str = "samples.parquet";
        let reader = zip.by_name(PARQUET_FILE_NAME).unwrap();
        reader.size()
    }
}
