use std::io::Read;

use futures::AsyncReadExt;

use crate::utils::print_to_cons::print_to_js_with_obj;
use std::io::Result;

use super::streambuf::WebFileReader;

pub struct CompleteFile {
    offset: u64
}

static mut ARRAY: Vec<u8> = Vec::new();

impl CompleteFile {

    pub fn  read_whole_file(length: u64) -> Self {
        let mut reader = WebFileReader::new_from_file(0, length as i32);
        let mut offset = 0;
        while offset != length {
            let readsize = (8 * 1024).min(length - offset) as usize;
            /* print_to_js_with_obj(&format!("{:?}", length).into());
            print_to_js_with_obj(&format!("{:?}", offset).into());
            print_to_js_with_obj(&format!("{:?}", readsize).into()); */
            let mut vec = vec![0;readsize];
            let result = reader.read(&mut vec);
            unsafe { 
                ARRAY.append(&mut vec);
            }
            offset = offset + readsize as u64;
        }
/*         print_to_js_with_obj(&format!("{:?}", "Finished").into());
 */
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

impl Read for CompleteFile {

    /* fn read_exact(&mut self, buf: &mut [u8]) -> Result<()> {
        print_to_js_with_obj(&format!("fuck it {:?}", "s").into());
        Ok(())
    } */

    fn read(&mut self, buf: &mut [u8]) -> std::io::Result<usize> {

/*         print_to_js_with_obj(&format!("{:?}", "Read").into());
 */
        let read_size = buf.len();
        
        unsafe {
            buf.clone_from_slice(&ARRAY[self.offset as usize .. (self.offset as usize) + read_size]);
        }

        self.offset = self.offset + (read_size as u64);

        Ok(read_size)
    }
}