use std::{
    cell::RefCell,
    collections::HashMap,
    sync::{Arc, Mutex},
};

use arrow::record_batch::RecordBatch;

use crate::web_file::serde_reader::SerdeDict;

pub struct RecordBatchShared {
    pub batch: RecordBatch,
}

//STATE STRUCT
pub struct State {
    // Batch State
    pub unfiltered_record_batch: Option<Arc<RecordBatchShared>>,
    pub swimlane_batch: Option<Arc<RecordBatchShared>>,
    pub event_batch: Option<Arc<RecordBatchShared>>,
    // Caching for queries
    pub queries: Arc<Mutex<HashMap<String, RecordBatch>>>,
    pub filtered_queries: Arc<Mutex<HashMap<String, RecordBatch>>>,
    // Mapping: Op <-> "Nice" Op
    pub mapping: Arc<Mutex<HashMap<String, String>>>,
    pub dict: Option<Arc<SerdeDict>>,
    // File Loading
    pub parquet_file_binary: Arc<Mutex<Vec<u8>>>,
    pub file_size: Option<u64>,
}

thread_local! {
    static STATE: RefCell<State> = RefCell::new(State {
        // Batch State
        unfiltered_record_batch: None,
        swimlane_batch: None,
        event_batch: None,
        // Caching for queries
        queries:  Arc::new(Mutex::new(HashMap::new())),
        filtered_queries: Arc::new(Mutex::new(HashMap::new())),
        // Mapping: Op <-> "Nice" Op
        mapping:  Arc::new(Mutex::new(HashMap::new())),
        dict: None,
        // File Loading
        parquet_file_binary: Arc::new(Mutex::new(Vec::new())),
        file_size: None,
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

// RECORD BATCH STATE - EVENT BATCH
pub fn get_event_record_batch() -> Option<Arc<RecordBatchShared>> {
    with_state(|s| s.event_batch.clone())
}
pub fn set_event_record_batch(record_batch: RecordBatch) {
    let shared_record_batch = RecordBatchShared {
        batch: record_batch,
    };
    _with_state_mut(|s| s.event_batch = Some(Arc::new(shared_record_batch)));
}
pub fn reset_event_record_batch() {
    _with_state_mut(|s| s.event_batch = None);
}

// RECORD BATCH STATE - SWIMLANE BATCH
pub fn get_swimlane_record_batch() -> Option<Arc<RecordBatchShared>> {
    with_state(|s| s.swimlane_batch.clone())
}
pub fn set_swimlane_record_batch(record_batch: RecordBatch) {
    let shared_record_batch = RecordBatchShared {
        batch: record_batch,
    };
    _with_state_mut(|s| s.swimlane_batch = Some(Arc::new(shared_record_batch)));
}
pub fn reset_swimlane_record_batch() {
    _with_state_mut(|s| s.swimlane_batch = None);
}

// RECORD BATCH STATE - GLOBAL BATCH
pub fn get_unfiltered_record_batch() -> Option<Arc<RecordBatchShared>> {
    with_state(|s| s.unfiltered_record_batch.clone())
}
pub fn set_unfiltered_record_batch(record_batches: RecordBatch) {
    let shared_record_batch = RecordBatchShared {
        batch: record_batches,
    };
    _with_state_mut(|s| s.unfiltered_record_batch = Some(Arc::new(shared_record_batch)));
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
    reset_event_record_batch(); 
    _with_state_mut(|s| {
        let mut hashmap = s.queries.lock().unwrap();
        hashmap.clear();
        let mut hashmap_mapping = s.mapping.lock().unwrap();
        hashmap_mapping.clear();
        let mut hashmap_filter = s.filtered_queries.lock().unwrap();
        hashmap_filter.clear();
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

// FILTER CACHE STATE
pub fn get_filter_query_from_cache() -> Arc<Mutex<HashMap<String, RecordBatch>>> {
    with_state(|s| s.filtered_queries.clone())
}
