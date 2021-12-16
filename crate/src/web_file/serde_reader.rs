use std::collections::HashMap;

use serde::Deserialize;
use serde_json::{Map, Value};

use super::parquet_reader::BufferReader;
use crate::web_file::serde_reader::Value::Number;

#[derive(Deserialize, Debug, Clone)]
struct Dictionary {
    operators: Map<String, Value>,
    pipelines: Map<String, Value>,
    events: Map<String, Value>,
    srclines: Map<String, Value>,
    dso: Map<String, Value>,
    mapping: Map<String, Value>,
    op_extension: Map<String, Value>,
    physical_op: Map<String, Value>,
}

#[derive(Deserialize, Clone, Debug)]
pub struct DictionaryUri {
    pub pipeline: Option<String>,
    pub uir: Option<String>,
    #[serde(rename = "instrId")]
    pub instrid: Option<String>,
    pub op: Option<String>,
}

#[derive(Clone)]
pub struct SerdeDict {
    pub dict: HashMap<String, HashMap<u64, String>>,
    pub uri_dict: HashMap<String, DictionaryUri>,
}

static DICT_FILE_NAME: &str = "dictionary_compression.json";
static URI_DICT_FILE_NAME: &str = "uir.json";
static QUERY_PLAN_FILE_NAME: &str = "query_plan_analyzed.json";

impl SerdeDict {
    pub fn read_dict(length: u64) -> Self {
        let reader = BufferReader::read_to_buffer(DICT_FILE_NAME, length as u64);
        let d: Dictionary = serde_json::from_reader(reader).unwrap();

        let mut hash_map = HashMap::new();
        for operator in d.operators {
            let inner_hash_map = hash_map
                .entry("operator".to_string())
                .or_insert(HashMap::new());
            let string = operator.0;
            if let Number(x) = operator.1 {
                let num = x.as_u64().unwrap();
                inner_hash_map.insert(num, string);
            }
        }

        for pipeline in d.pipelines {
            let inner_hash_map = hash_map
                .entry("pipeline".to_string())
                .or_insert(HashMap::new());
            let string = pipeline.0;
            if let Number(x) = pipeline.1 {
                let num = x.as_u64().unwrap();
                inner_hash_map.insert(num, string);
            }
        }

        for event in d.events {
            let inner_hash_map = hash_map
                .entry("event".to_string())
                .or_insert(HashMap::new());
            let string = event.0;
            if let Number(x) = event.1 {
                let num = x.as_u64().unwrap();
                inner_hash_map.insert(num, string);
            }
        }

        for srclines in d.srclines {
            let inner_hash_map = hash_map
                .entry("srclines".to_string())
                .or_insert(HashMap::new());
            let string = srclines.0;
            if let Number(x) = srclines.1 {
                let num = x.as_u64().unwrap();
                inner_hash_map.insert(num, string);
            }
        }

        for op_extension in d.op_extension{
            let inner_hash_map = hash_map
                .entry("op_extension".to_string())
                .or_insert(HashMap::new());
            let string = op_extension.0;
            if let Number(x) = op_extension.1 {
                let num = x.as_u64().unwrap();
                inner_hash_map.insert(num, string);
            }
        }

        for physical_op in d.physical_op {
            let inner_hash_map = hash_map
                .entry("physical_op".to_string())
                .or_insert(HashMap::new());
            let string = physical_op.0;
            if let Number(x) = physical_op.1 {
                let num = x.as_u64().unwrap();
                inner_hash_map.insert(num, string);
            }
        }

        let reader = BufferReader::read_to_buffer(URI_DICT_FILE_NAME, length as u64);
        let d: HashMap<String, DictionaryUri> = serde_json::from_reader(reader).unwrap();

        return Self {
            dict: hash_map,
            uri_dict: d,
        };
    }
}
