use std::io::{Read, Seek, SeekFrom};


use std::io::Result;

use super::streambuf::WebFileReader;

pub struct Json_File {
    offset: u64,
    length: u64
}

static mut ARRAY: Vec<u8> = Vec::new();

impl Json_File {

    pub fn  read_whole_file(file_size: u64) -> Self {

        let mut zip = zip::ZipArchive::new(WebFileReader::new_from_file(file_size as i32)).unwrap();
        let mut reader = zip.by_name("dictionary_compression.json").unwrap(); 
        let length = reader.size();
        let start_offset = reader.data_start();
        let web_file_reader = WebFileReader::new_from_file(file_size as i32);
        let mut reader = web_file_reader.set_offset(start_offset as i32);

        let mut offset = 0;
        while offset != length {
            let readsize = (8 * 1024).min(length - offset) as usize;
            let mut vec = vec![0;readsize];
            let result = reader.read(&mut vec);
            unsafe { 
                ARRAY.append(&mut vec);
            }
            offset = offset + readsize as u64;
        }

        Self {
            offset: 0,
            length: 0
        }
    }

}

impl Read for Json_File {


    fn read(&mut self, buf: &mut [u8]) -> std::io::Result<usize> {

        let read_size = buf.len();
        
        unsafe {
            buf.clone_from_slice(&ARRAY[self.offset as usize .. (self.offset as usize) + read_size]);
        }

        self.offset = self.offset + (read_size as u64);

        Ok(read_size)
    }
}


impl Seek for Json_File {
    
    fn seek(&mut self, pos: std::io::SeekFrom) -> Result<u64> {
        self.offset = match pos {
            SeekFrom::Current(ofs) => self.offset + (self.length - self.offset).min(ofs as u64),
            SeekFrom::Start(ofs) => self.length.min(ofs as u64),
            SeekFrom::End(ofs) => self.length - self.length.min(ofs as u64),
        };
        Ok(self.offset)    }
}