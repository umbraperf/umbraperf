use std::{collections::HashMap, io::BufReader};

use serde::Deserialize;
use serde_json::{Map,Value};

use super::streambuf::WebFileReader;
use crate::web_file::serde_reader::Value::Number;

#[derive(Deserialize, Debug, Clone)]
struct Dictionary {
    operators: Map<String, Value>,
    pipelines: Map<String, Value>,
    events: Map<String, Value>,
    srclines: Map<String, Value>,
    dso: Map<String, Value>,
    mapping: Map<String, Value>,
}

#[derive(Deserialize, Clone, Debug)]
pub struct DictionaryUri {
    pub pipeline: Option<String>,
    pub uir: Option<String>, 
    #[serde(rename = "instrId")]
    pub instrid: Option<String>, 
    pub op: Option<String>
}

#[derive(Clone)]
pub struct SerdeDict {
    pub dict: HashMap<String, HashMap<u64, String>>,
    pub uri_dict: HashMap<String, DictionaryUri>
}

static DICT_FILE_NAME: &str = "dictionary_compression.json";
static URI_DICT_FILE_NAME: &str = "uir.json";


impl SerdeDict {

    pub fn read_dict(length: u64) -> Self {
        let mut zip = zip::ZipArchive::new(WebFileReader::new_from_file(length as i32)).unwrap();
        let reader = zip.by_name(DICT_FILE_NAME).unwrap();
        let reader = BufReader::new(reader);
        let d: Dictionary = serde_json::from_reader(reader).unwrap();

        let mut hash_map = HashMap::new();
        for operator in d.operators {
            let inner_hash_map = hash_map.entry("operator".to_string()).or_insert(HashMap::new());
            let string = operator.0;
            if let Number(x) = operator.1 {
                let num = x.as_u64().unwrap();
                inner_hash_map.insert(num, string);
            }
        }

        for pipeline in d.pipelines {
            let inner_hash_map = hash_map.entry("pipeline".to_string()).or_insert(HashMap::new());
            let string = pipeline.0;
            if let Number(x) = pipeline.1 {
                let num = x.as_u64().unwrap();
                inner_hash_map.insert(num, string);
            }
        }

        for event in d.events {
            let inner_hash_map = hash_map.entry("event".to_string()).or_insert(HashMap::new());
            let string = event.0;
            if let Number(x) = event.1 {
                let num = x.as_u64().unwrap();
                inner_hash_map.insert(num, string);
            }
        }

        for srclines in d.srclines {
            let inner_hash_map = hash_map.entry("srclines".to_string()).or_insert(HashMap::new());
            let string = srclines.0;
            if let Number(x) = srclines.1 {
                let num = x.as_u64().unwrap();
                inner_hash_map.insert(num, string);
            }
        }

        let reader = zip.by_name(URI_DICT_FILE_NAME).unwrap();
        let reader = BufReader::new(reader);
        let d: HashMap<String, DictionaryUri> = serde_json::from_reader(reader).unwrap();

        return Self { dict:  hash_map, uri_dict: d};

    }

}
