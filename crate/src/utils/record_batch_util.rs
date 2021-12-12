use crate::{
    bindings::notify_js_query_result, state::state::get_serde_dict,
    web_file::web_file_chunkreader::WebFileChunkReader,
};
use arrow::{
    array::{Array, ArrayRef, Int64Array, StringArray, Float64Array, UInt64Array},
    datatypes::{DataType, Field, Schema, SchemaRef},
    record_batch::RecordBatch,
};
use parquet::{
    arrow::{arrow_reader::ParquetRecordBatchReader, ArrowReader, ParquetFileArrowReader},
    file::serialized_reader::SerializedFileReader,
};
use std::{io::Cursor, sync::Arc};

pub fn create_record_batch(schema: SchemaRef, columns: Vec<ArrayRef>) -> RecordBatch {
    return RecordBatch::try_new(schema, columns).unwrap();
}

pub fn init_reader(file_size: i32) -> ParquetRecordBatchReader {
    let webfile_chunkreader = WebFileChunkReader::new(file_size as i32);
    let reader = SerializedFileReader::new(webfile_chunkreader).unwrap();
    let mut reader = ParquetFileArrowReader::new(Arc::new(reader));
    let record_reader = reader
        .get_record_reader_by_columns(vec![0, 1, 2, 3, 10, 6].into_iter(), 1024 * 8)
        .unwrap();
    record_reader
}

pub fn init_record_batches(file_size: i32) -> Vec<RecordBatch> {
    let mut record_reader = init_reader(file_size);
    let mut vec = Vec::new();
    while let Some(record) = record_reader.next() {
        vec.push(record.unwrap());
    }
    vec
}

fn flatten<T>(nested: Vec<Vec<T>>) -> Vec<T> {
    nested.into_iter().flatten().collect()
}

pub fn concat_record_batches(vec_batch: Vec<RecordBatch>) -> RecordBatch {
    let mut vec_fields = Vec::new();
    let mut vec_columns = Vec::new();

    for batch in vec_batch {
        vec_fields.push(batch.schema().fields().to_owned());
        vec_columns.push(batch.columns().to_owned());
    }

    let fields = flatten::<Field>(vec_fields);
    let columns = flatten::<Arc<dyn Array>>(vec_columns);

    let schema = Schema::new(fields);
    let batch = RecordBatch::try_new(Arc::new(schema), columns);

    batch.unwrap()
}

pub fn create_new_record_batch(
    field_names: Vec<&str>,
    data_type: Vec<DataType>,
    columns_ref: Vec<ArrayRef>,
) -> RecordBatch {
    let mut fields = Vec::new();
    let to = field_names.len();
    for i in 0..to {
        let field = Field::new(field_names[i], data_type.get(i).unwrap().to_owned(), false);
        fields.push(field);
    }

    let schema = Schema::new(fields);

    let batch = RecordBatch::try_new(Arc::new(schema), columns_ref).unwrap();
    return batch;
}

// Converts Vec<RecordBatch> to one whole RecordBatch
pub fn convert(batches: Vec<RecordBatch>) -> RecordBatch {
    let number_columns = batches[0].num_columns() as i32;
    let mut to_concat_array = Vec::new();

    for i in 0..number_columns {
        let mut array_vec = Vec::new();
        for batch in &batches {
            array_vec.push(batch.column(i as usize).as_ref());
        }
        to_concat_array.push(array_vec);
    }

    let mut columns = Vec::new();
    for array in to_concat_array {
        let concat_array = arrow::compute::kernels::concat::concat(&array);
        columns.push(concat_array.unwrap());
    }

    let batch = create_record_batch(batches[0].schema(), columns);
    mapping_with_dict(batch)
}

pub fn convert_without_mapping(batches: Vec<RecordBatch>) -> RecordBatch {
    let number_columns = batches[0].num_columns() as i32;
    let mut to_concat_array = Vec::new();

    for i in 0..number_columns {
        let mut array_vec = Vec::new();
        for batch in &batches {
            array_vec.push(batch.column(i as usize).as_ref());
        }
        to_concat_array.push(array_vec);
    }

    let mut columns = Vec::new();
    for array in to_concat_array {
        let concat_array = arrow::compute::kernels::concat::concat(&array);
        columns.push(concat_array.unwrap());
    }

    create_record_batch(batches[0].schema(), columns)
}

pub fn mapping_with_dict(batch: RecordBatch) -> RecordBatch {
    let serde = get_serde_dict().unwrap();

    let operator_col = batch
        .column(0)
        .as_any()
        .downcast_ref::<Int64Array>()
        .unwrap();

    let mut operator_vec = Vec::new();
    let hash_map = serde.dict.get("operator").unwrap();
    for value in operator_col {
        let value = &(value.unwrap() as u64);
        let dict_key = hash_map.get(value);

        operator_vec.push(dict_key.unwrap().as_str());
    }

    let event_nam = batch
        .column(3)
        .as_any()
        .downcast_ref::<Int64Array>()
        .unwrap();

    let mut event_vec = Vec::new();
    let hash_map = serde.dict.get("event").unwrap();
    for value in event_nam {
        let dict_key = hash_map.get(&(value.unwrap() as u64));
        event_vec.push(dict_key.unwrap().as_str());
    }

    let time_col = batch.column(2)
        .as_any()
        .downcast_ref::<Float64Array>()
        .unwrap();

    let mut time = Vec::new();
    for value in time_col {
        time.push(value.unwrap());
    }

    let pipeline = batch
        .column(1)
        .as_any()
        .downcast_ref::<Int64Array>()
        .unwrap();

    let mut pipeline_vec = Vec::new();
    let hash_map = serde.dict.get("pipeline").unwrap();
    for value in pipeline {
        let dict_key = hash_map.get(&(value.unwrap() as u64));
        pipeline_vec.push(dict_key.unwrap().as_str());
    }

    let addr_col = batch.column(5)
        .as_any()
        .downcast_ref::<UInt64Array>()
        .unwrap();

    let mut addr = Vec::new();
    for value in addr_col {
        addr.push(value.unwrap());
    }

    let uri_col = batch.column(4)
        .as_any()
        .downcast_ref::<Int64Array>()
        .unwrap();

    let mut uri = Vec::new();
    for value in uri_col {
        uri.push(value.unwrap());
    }
    
    /* operator_vec.push("test_Operator");
    event_vec.push("test_Event");
    time.push(99.0);
    pipeline_vec.push("test_Pipeline");
    addr.push(12341234);
    uri.push(2);  */

    create_new_record_batch(
        vec!["operator", "ev_name", "time", "pipeline", "addr", "uri"],
        vec![
            DataType::Utf8,
            DataType::Utf8,
            DataType::Float64,
            DataType::Utf8,
            DataType::UInt64,
            DataType::Int64,
        ],
        vec![
            Arc::new(StringArray::from(operator_vec)),
            Arc::new(StringArray::from(event_vec)),
            Arc::new(Float64Array::from(time)),
            Arc::new(StringArray::from(pipeline_vec)),
            Arc::new(UInt64Array::from(addr)),
            Arc::new(Int64Array::from(uri)),
        ],
    )
}


// Sending record batch to javascript via IPC which include a schema and a message
pub fn send_record_batch_to_js(record_batch: &RecordBatch) {
    let mut buff = Cursor::new(vec![]);

    let options = arrow::ipc::writer::IpcWriteOptions::default();
    let mut dict = arrow::ipc::writer::DictionaryTracker::new(true);

    let encoded_schema = arrow::ipc::writer::IpcDataGenerator::schema_to_bytes(
        &arrow::ipc::writer::IpcDataGenerator::default(),
        &record_batch.schema(),
        &options,
    );
    let encoded_message = arrow::ipc::writer::IpcDataGenerator::encoded_batch(
        &arrow::ipc::writer::IpcDataGenerator::default(),
        &record_batch,
        &mut dict,
        &options,
    );

    let _writer_schema = arrow::ipc::writer::write_message(&mut buff, encoded_schema, &options);
    let _writer_mess =
        arrow::ipc::writer::write_message(&mut buff, encoded_message.unwrap().1, &options);

    notify_js_query_result(buff.into_inner());
}
