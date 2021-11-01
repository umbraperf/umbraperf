use std::{collections::HashMap, io::BufReader};

use serde::Deserialize;
use serde_json::{Map, Value};

use crate::{utils::print_to_cons::print_to_js_with_obj, web_file::{json_file::Json_File, whole_file::CompleteFile}};

use super::streambuf::WebFileReader;

#[derive(Deserialize, Debug)]
struct Dictionary {
    operators: Map<String, Value>,
    pipelines: Map<String, Value>,
    events: Map<String, Value>,
    srclines: Map<String, Value>,
    dso: Map<String, Value>,
    mapping: Map<String, Value>,
}


pub fn read_dict(length: u64) -> HashMap<String, i64> {

    print_to_js_with_obj(&format!("Read dict {:?}", "In Read dict").into());

    let mut zip = zip::ZipArchive::new(WebFileReader::new_from_file(length as i32)).unwrap();
    let mut reader = zip.by_name("dictionary_compression.json").unwrap(); 

    let mut reader = BufReader::new(reader);
  
    let d: Dictionary = serde_json::from_reader(reader).unwrap();

    let events = d.events;

    let hashMap = HashMap::new();

    return hashMap;
    
}
