use std::{cell::RefCell, collections::HashMap, sync::{Arc, Mutex}};

use arrow::record_batch::RecordBatch;

use crate::web_file::serde_reader::SerdeDict;

pub struct RecordBatchShared {
    pub batch: RecordBatch,
}

//STATE STRUCT
pub struct State {
    pub record_batches: Option<Arc<RecordBatchShared>>,
    pub queries: Arc<Mutex<HashMap<String, RecordBatch>>>,
    pub mapping: Arc<Mutex<HashMap<String, String>>>,
    pub dict: Option<Arc<SerdeDict>>,
    pub parquet_file_binary: Arc<Mutex<Vec<u8>>>,
    pub file_size: Option<u64>,
    pub uir_record_batches: Option<Arc<RecordBatchShared>>
}

thread_local! {
    static STATE: RefCell<State> = RefCell::new(State {
        record_batches: None,
        queries:  Arc::new(Mutex::new(HashMap::new())),
        mapping:  Arc::new(Mutex::new(HashMap::new())),
        dict: None,
        parquet_file_binary: Arc::new(Mutex::new(Vec::new())),
        file_size: None,
        uir_record_batches: None
    });
}

// STATE ACCESS
fn with_state<Callback, ReturnType>(cb: Callback) -> ReturnType
where
    Callback: FnOnce(&State) -> ReturnType,
{
    STATE.with(|s| cb(&s.borrow()))
}

fn _with_state_mut<Callback, ReturnType>(cb: Callback) -> ReturnType
where
    Callback: FnOnce(&mut State) -> ReturnType,
{
    STATE.with(|s| cb(&mut s.borrow_mut()))
}

// RECORD BATCH STATE
pub fn get_record_batches() -> Option<Arc<RecordBatchShared>> {
    with_state(|s| s.record_batches.clone())
}
pub fn set_record_batches(record_batches: RecordBatch) {
    let shared_record_batch = RecordBatchShared {
        batch: record_batches,
    };
    _with_state_mut(|s| s.record_batches = Some(Arc::new(shared_record_batch)));
}

// MAPPING STATE
pub fn get_mapping_operator() -> Arc<Mutex<HashMap<String, String>>> {
    with_state(|s| s.mapping.clone())
}

pub fn insert_mapping_hashmap(hashmap: HashMap<String, String>) {
    _with_state_mut(|s| {
        s.mapping = Arc::new(Mutex::new(hashmap));
    });
}

// BUFFER STATE
pub fn get_buffer() -> Arc<Mutex<Vec<u8>>> {
    with_state(|s| s.parquet_file_binary.clone())
}
pub fn append_to_buffer(mut vec: Vec<u8>) {
    _with_state_mut(|s| {
        let mut binary = s.parquet_file_binary.lock().unwrap();
        binary.append(&mut vec);
    });
}
pub fn clear_buffer() {
    _with_state_mut(|s| {
        s.parquet_file_binary = Arc::new(Mutex::new(Vec::new()));
    });
}

// READER STATE
pub fn get_serde_dict() -> Option<Arc<SerdeDict>> {
    with_state(|s| s.dict.clone())
}
pub fn _get_file_size() -> Option<u64> {
    with_state(|s| s.file_size.clone())
}
pub fn set_file_size(file_size: u64) {
    _with_state_mut(|s| s.file_size = Some(file_size));
}
pub fn set_serde_dict(serde_dict: SerdeDict) {
    _with_state_mut(|s| s.dict = Some(Arc::new(serde_dict)));
}

// CACHE STATE
pub fn clear_cache() {
    _with_state_mut(|s| {
        let mut hashmap = s.queries.lock().unwrap();
        hashmap.clear();
        let mut hashmap_mapping = s.mapping.lock().unwrap();
        hashmap_mapping.clear();
    });
}
pub fn insert_query_to_cache(restful_string: &str, record_batch: RecordBatch) {
    _with_state_mut(|s| {
        let mut hashmap = s.queries.lock().unwrap();
        hashmap.insert(restful_string.to_string(), record_batch)
    });
}
pub fn get_query_from_cache() -> Arc<Mutex<HashMap<String, RecordBatch>>> {
    with_state(|s| s.queries.clone())
}