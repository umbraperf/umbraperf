use std::{collections::HashMap, io::BufReader};

use serde::Deserialize;

use super::streambuf::WebFileReader;

#[derive(Deserialize, Clone, Debug)]
pub struct Dictionary {
    pipeline: Option<String>,
    uir: Option<String>, 
    #[serde(rename = "instrId")]
    instrid: Option<String>, 
    op: Option<String>
}

#[derive(Clone)]
pub struct UIRReader {
    pub dict: HashMap<String, Dictionary>,
}

static DICT_FILE_NAME: &str = "uir.json";

impl UIRReader {

    pub fn read_uir_dict(length: u64) -> Self {
        let mut zip = zip::ZipArchive::new(WebFileReader::new_from_file(length as i32)).unwrap();
        let reader = zip.by_name(DICT_FILE_NAME).unwrap();
        let reader = BufReader::new(reader);
        let d: HashMap<String, Dictionary> = serde_json::from_reader(reader).unwrap();

        return Self { dict:  d};

    }

}
