use std::io::{Seek, SeekFrom, Read};
use std::io::Result;
use super::bindings::WebFile;

pub struct WebFileReader {
    file: WebFile,
    offset: u64,
    length: u64,
}

impl WebFileReader {
    pub fn new_from_file(file: WebFile) -> Self {
        let file_length: u64 = file.length();
        Self {
            file,
            offset: 0,
            length: file_length
        }
    }
}

impl Seek for WebFileReader {
    // XXX Fix negative offsets
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


impl Read for WebFileReader {
    fn read(&mut self, out: &mut [u8]) -> Result<usize> {
        /* let read_here = out.length.min(self.length - self.offset);
        let read = self.file.ask_js_for_chunk(out, read_here);
        self.offset += read_here;
        Ok(read_here) */
        let size: usize = 0;
        Ok(size)
    }
}