use std::{collections::HashMap, io::{BufReader, Read}, sync::Arc};
use crate::{
    bindings::send_js_query_plan, utils::print_to_cons::print_to_js_with_obj,
};

use arrow::{array::{ArrayRef, Float64Array}, datatypes::{DataType, Field, Schema}, record_batch::RecordBatch};
use csv::StringRecord;
use serde::Deserialize;
use serde_json::{Map, Value};

use super::{parquet_reader::BufferReader, streambuf::WebFileReader};
use crate::{web_file::serde_reader::Value::Number};

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
    pub dict: HashMap<i64, HashMap<u64, String>>,
    pub uri_dict: HashMap<String, DictionaryUri>,
    pub batch: RecordBatch
}

static DICT_FILE_NAME: &str = "dictionary_compression.json";
static URI_DICT_FILE_NAME: &str = "uir.json";
static QUERY_PLAN_FILE_NAME: &str = "query_plan_analyzed.json";
static TMAM_FILE_NAME: &str = "tmam.csv";

pub enum DictFields {
    Operator = 0,
    Pipeline = 1,
    Event = 2,
    Srcline = 3,
    OpExtension = 4,
    PhysicalOp = 5,
}

impl SerdeDict {
    pub fn read_dict(length: u64) -> Self {

        let mut zip =
            zip::ZipArchive::new(WebFileReader::new_from_file(length as i32)).unwrap();
        let reader = zip.by_name(QUERY_PLAN_FILE_NAME).unwrap();
        let mut buf_reader = BufReader::new(reader);

        let mut buf: String = String::new();
        let _result = buf_reader.read_to_string(&mut buf);

        let reader = BufferReader::read_to_buffer(DICT_FILE_NAME, length as u64);
        let buf_reader = BufReader::new(reader);
        let d: Dictionary = serde_json::from_reader(buf_reader).unwrap();

        let mut hash_map = HashMap::new();
        for operator in d.operators {
            let inner_hash_map = hash_map
                .entry(DictFields::Operator as i64)
                .or_insert(HashMap::new());
            let string = operator.0;
            if let Number(x) = operator.1 {
                let num = x.as_u64().unwrap();
                inner_hash_map.insert(num, string);
            }
        }

        for pipeline in d.pipelines {
            let inner_hash_map = hash_map
                .entry(DictFields::Pipeline as i64)
                .or_insert(HashMap::new());
            let string = pipeline.0;
            if let Number(x) = pipeline.1 {
                let num = x.as_u64().unwrap();
                inner_hash_map.insert(num, string);
            }
        }

        for event in d.events {
            let inner_hash_map = hash_map
                .entry(DictFields::Event as i64)
                .or_insert(HashMap::new());
            let string = event.0;
            if let Number(x) = event.1 {
                let num = x.as_u64().unwrap();
                inner_hash_map.insert(num, string);
            }
        }

        for srclines in d.srclines {
            let inner_hash_map = hash_map
                .entry(DictFields::Srcline as i64)
                .or_insert(HashMap::new());
            let string = srclines.0;
            if let Number(x) = srclines.1 {
                let num = x.as_u64().unwrap();
                inner_hash_map.insert(num, string);
            }
        }

        for op_extension in d.op_extension{
            let inner_hash_map = hash_map
                .entry(DictFields::OpExtension as i64)
                .or_insert(HashMap::new());
            let string = op_extension.0;
            if let Number(x) = op_extension.1 {
                let num = x.as_u64().unwrap();
                inner_hash_map.insert(num, string);
            }
        }

        for physical_op in d.physical_op {
            let inner_hash_map = hash_map
                .entry(DictFields::PhysicalOp as i64)
                .or_insert(HashMap::new());
            let string = physical_op.0;
            if let Number(x) = physical_op.1 {
                let num = x.as_u64().unwrap();
                inner_hash_map.insert(num, string);
            }
        }

        let reader = BufferReader::read_to_buffer(URI_DICT_FILE_NAME, length as u64);
        let buf_reader = BufReader::new(reader);
        let d: HashMap<String, DictionaryUri> = serde_json::from_reader(buf_reader).unwrap();

        let csv_reader = BufferReader::read_to_buffer(TMAM_FILE_NAME, length as u64);
        let buf_reader = BufReader::new(csv_reader);
        let mut tmam_csv: Vec<StringRecord> = Vec::new();

        print_to_js_with_obj(&format!("start reading csv").into());

        let schema = Schema::new(vec![
            Field::new("time", DataType::Float64, false),
            Field::new("% retiring", DataType::Float64, false),
            Field::new("% backend_bound", DataType::Float64, false),
            Field::new("% frontend_bound", DataType::Float64, false),
            Field::new("% bad_speculation", DataType::Float64, false),
        ]);

        print_to_js_with_obj(&format!("read schema").into());

        // Initialize vectors for each column
        let mut time_col: Vec<f64> = Vec::new();
        let mut retiring_col: Vec<f64> = Vec::new();
        let mut backend_bound_col: Vec<f64> = Vec::new();
        let mut frontend_bound_col: Vec<f64> = Vec::new();
        let mut bad_speculation_col: Vec<f64> = Vec::new();

        let mut rdr = csv::Reader::from_reader(buf_reader);
        for result in rdr.records() {
            let record = result.unwrap();
            tmam_csv.push(record.clone());

            print_to_js_with_obj(&format!("Read CSV data: {:?}", record).into());

            // Parse values from each record
            time_col.push(record.get(0).unwrap_or("0.0").parse::<f64>().unwrap_or(0.0));
            retiring_col.push(record.get(1).unwrap_or("0.0").parse::<f64>().unwrap_or(0.0));
            backend_bound_col.push(record.get(2).unwrap_or("0.0").parse::<f64>().unwrap_or(0.0));
            frontend_bound_col.push(record.get(3).unwrap_or("0.0").parse::<f64>().unwrap_or(0.0));
            bad_speculation_col.push(record.get(4).unwrap_or("0.0").parse::<f64>().unwrap_or(0.0));
        }

        print_to_js_with_obj(&format!("read read cols").into());

        // Create Arrow arrays for each column
        let columns: Vec<ArrayRef> = vec![
            Arc::new(Float64Array::from(time_col)) as ArrayRef,
            Arc::new(Float64Array::from(retiring_col)) as ArrayRef,
            Arc::new(Float64Array::from(backend_bound_col)) as ArrayRef,
            Arc::new(Float64Array::from(frontend_bound_col)) as ArrayRef,
            Arc::new(Float64Array::from(bad_speculation_col)) as ArrayRef,
        ];

        print_to_js_with_obj(&format!("record").into());

        let batch = RecordBatch::try_new(Arc::new(schema), columns).unwrap();

        print_to_js_with_obj(&format!("record batch is: {:?}", batch).into());

        send_js_query_plan(buf);

        return Self {
            dict: hash_map,
            uri_dict: d,
            batch: batch,
        };
    }
}
