use crate::{
    bindings::send_js_query_result,
    state::state::get_serde_dict,
    web_file::{serde_reader::DictFields, web_file_chunkreader::WebFileChunkReader}, exec::basic::{basic::sort_batch, filter::filter_with},
};
use arrow::{
    array::{Array, ArrayRef, Float64Array, Int64Array, StringArray, UInt64Array},
    datatypes::{DataType, Field, Schema, SchemaRef},
    record_batch::RecordBatch,
};
use parquet::{
    arrow::{arrow_reader::ParquetRecordBatchReader, ArrowReader, ParquetFileArrowReader},
    file::serialized_reader::SerializedFileReader,
};
use std::{io::Cursor, sync::Arc, collections::HashSet, iter::FromIterator};

use super::{array_util::{get_floatarray_column, get_int64_column, get_uint_column}, print_to_cons::print_to_js_with_obj};

pub fn create_record_batch(schema: SchemaRef, columns: Vec<ArrayRef>) -> RecordBatch {
    return RecordBatch::try_new(schema, columns).unwrap();
}

fn flatten<T>(nested: Vec<Vec<T>>) -> Vec<T> {
    nested.into_iter().flatten().collect()
}

// Parquet Reader, specify columns which are read
pub fn init_reader(file_size: i32) -> ParquetRecordBatchReader {
    let webfile_chunkreader = WebFileChunkReader::new(file_size as i32);
    let reader = SerializedFileReader::new(webfile_chunkreader).unwrap();
    let mut reader = ParquetFileArrowReader::new(Arc::new(reader));
    let record_reader = reader
        .get_record_reader_by_columns(vec![0, 1, 2, 3, 10, 6, 13, 14].into_iter(), 1024 * 8)
        .unwrap();
    record_reader
}

// Record is read in batches
pub fn init_record_batches(file_size: i32) -> Vec<RecordBatch> {
    let mut record_reader = init_reader(file_size);
    let mut vec = Vec::new();
    while let Some(record) = record_reader.next() {
        vec.push(record.unwrap());
    }
    vec
}

// Combine multiple record batches to one
pub fn combine_to_one_record_batch(vec_batch: Vec<RecordBatch>) -> RecordBatch {
    let mut fields_vec = Vec::new();
    let mut col_vec = Vec::new();

    for batch in vec_batch {
        fields_vec.push(batch.schema().fields().to_owned());
        col_vec.push(batch.columns().to_owned());
    }

    let fields = flatten::<Field>(fields_vec);
    let columns = flatten::<Arc<dyn Array>>(col_vec);

    let schema = Schema::new(fields);
    let batch = RecordBatch::try_new(Arc::new(schema), columns);

    batch.unwrap()
}

// Creating a new record batch, this method simplfies record batch creation
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
    apply_mapping_to_record_batch(batch)
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

pub fn apply_mapping_to_record_batch(batch: RecordBatch) -> RecordBatch {
    let serde = get_serde_dict().unwrap();

    // Operator
    let operator_col = get_int64_column(&batch, 0);
    let mut operator_vec = Vec::new();
    let hash_map = serde.dict.get(&(DictFields::Operator as i64)).unwrap();
    for value in operator_col {
        let value = &(value.unwrap() as u64);
        let dict_key = hash_map.get(value);

        operator_vec.push(dict_key.unwrap().as_str());
    }

    // Event
    let event_nam = get_int64_column(&batch, 3);
    let mut event_vec = Vec::new();
    let hash_map = serde.dict.get(&(DictFields::Event as i64)).unwrap();
    for value in event_nam {
        let dict_key = hash_map.get(&(value.unwrap() as u64));
        event_vec.push(dict_key.unwrap().as_str());
    }

    // Time
    let time_col = get_floatarray_column(&batch, 2);
    let mut time = Vec::new();
    for value in time_col {
        time.push(value.unwrap());
    }

    // Pipeline
    let pipeline = get_int64_column(&batch, 1);
    let mut pipeline_vec = Vec::new();
    let hash_map = serde.dict.get(&(DictFields::Pipeline as i64)).unwrap();
    for value in pipeline {
        let dict_key = hash_map.get(&(value.unwrap() as u64));
        pipeline_vec.push(dict_key.unwrap().as_str());
    }

    // Address
    let addr_col = get_uint_column(&batch, 5);
    let mut addr = Vec::new();
    for value in addr_col {
        addr.push(value.unwrap());
    }

    // URI
    let uri_col = get_int64_column(&batch, 4);
    let mut uri = Vec::new();
    for value in uri_col {
        uri.push(value.unwrap());
    }

    // Opt_ext
    let op_ext_col = get_int64_column(&batch, 6);
    let mut op_extension = Vec::new();
    let hash_map = serde.dict.get(&(DictFields::OpExtension as i64)).unwrap();
    for value in op_ext_col {
        let dict_key = hash_map.get(&(value.unwrap() as u64));
        op_extension.push(dict_key.unwrap().as_str());
    }

    // Physical operation
    let pyhs_op_col = get_int64_column(&batch, 7);
    let mut physical_op = Vec::new();
    let hash_map = serde.dict.get(&(DictFields::PhysicalOp as i64)).unwrap();
    for value in pyhs_op_col {
        let dict_key = hash_map.get(&(value.unwrap() as u64));
        physical_op.push(dict_key.unwrap().as_str());
    }

    let batch = create_new_record_batch(
        vec![
            "operator",
            "ev_name",
            "time",
            "pipeline",
            "addr",
            "uri",
            "op_ext",
            "physical_op",
        ],
        vec![
            DataType::Utf8,
            DataType::Utf8,
            DataType::Float64,
            DataType::Utf8,
            DataType::UInt64,
            DataType::Int64,
            DataType::Utf8,
            DataType::Utf8,
        ],
        vec![
            Arc::new(StringArray::from(operator_vec.clone())),
            Arc::new(StringArray::from(event_vec)),
            Arc::new(Float64Array::from(time)),
            Arc::new(StringArray::from(pipeline_vec)),
            Arc::new(UInt64Array::from(addr)),
            Arc::new(Int64Array::from(uri)),
            Arc::new(StringArray::from(op_extension)),
            Arc::new(StringArray::from(physical_op)),
        ],
    );

    let mut op_unique: HashSet<&str> = HashSet::from_iter(operator_vec);
    op_unique.remove("analyzeplan1");
    let hashset = Vec::from_iter(op_unique);
    return filter_with(0, hashset, &batch);
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

    print_to_js_with_obj(&format!("{:?}", buff.get_ref().len()).into());

    send_js_query_result(buff.into_inner());
}
