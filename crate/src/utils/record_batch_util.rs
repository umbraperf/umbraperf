use std::{io::Cursor, sync::Arc};
use arrow::{array::{Array, ArrayRef}, csv::Reader, datatypes::{DataType, Field, Schema, SchemaRef}, record_batch::RecordBatch};
use crate::{bindings::notify_js_query_result, utils::print_to_cons::print_to_js_with_obj, web_file::{serde_reader::read_dict, streambuf::WebFileReader, web_file_chunkreader::WebFileChunkReader}};
use parquet::{arrow::{ArrowReader, ParquetFileArrowReader}, file::serialized_reader::SerializedFileReader};

pub fn create_record_batch(schema: SchemaRef, columns: Vec<ArrayRef>) -> RecordBatch {
    return RecordBatch::try_new(schema, columns).unwrap();
}

// Init record batch of JavaScript
pub fn init_record_batches(
    file_size: i32
) -> Vec<RecordBatch> {

    let webfile_chunkreader = WebFileChunkReader::new(file_size as i32);
    let reader = SerializedFileReader::new(webfile_chunkreader).unwrap();
    let mut reader = ParquetFileArrowReader::new(Arc::new(reader));
    let mut record_reader= reader.get_record_reader_by_columns(vec![0,1,2,3,11].into_iter(), 1024 * 8).unwrap();
    
    let mut vec = Vec::new();

    while let Some(record) = record_reader.next() {
        vec.push(record.unwrap());
    }

    read_dict(file_size as u64);

    //let mut zip = zip::ZipArchive::new(WebFileReader::new_from_file(file_size as i32)).unwrap();
    //let mut reader = zip.by_name("dictionary_compression.json").unwrap(); 

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

pub fn create_new_record_batch(field_names: Vec<&str>, data_type: Vec<DataType>, columns_ref: Vec<ArrayRef>) -> RecordBatch {

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

    create_record_batch(batches[0].schema(), columns)
}

// Send one record batch to JavaScript
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
    let _writer_mess = arrow::ipc::writer::write_message(&mut buff, encoded_message.unwrap().1, &options);

    notify_js_query_result(buff.into_inner());
}
