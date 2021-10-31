use std::{io::Cursor, sync::Arc};
use arrow::{array::{Array, ArrayRef}, csv::Reader, datatypes::{DataType, Field, Schema, SchemaRef}, record_batch::RecordBatch};
use crate::{bindings::notify_js_query_result, utils::print_to_cons::print_to_js_with_obj, web_file::streambuf::WebFileReader};
use parquet::file::serialized_reader::SerializedFileReader;

pub fn create_record_batch(schema: SchemaRef, columns: Vec<ArrayRef>) -> RecordBatch {
    return RecordBatch::try_new(schema, columns).unwrap();
}

// Schema of CSV
fn init_schema() -> Schema {
    let field_operator = Field::new("operator", DataType::Utf8, false);
    let field_uir_code = Field::new("uir_code", DataType::Utf8, false);
    let field_srcline = Field::new("srcline", DataType::Utf8, false);
    let field_comm = Field::new("comm", DataType::Utf8, false);
    let field_dso = Field::new("dso", DataType::Utf8, false);
    let field_ev_name = Field::new("ev_name", DataType::Utf8, false);
    let field_symbol = Field::new("symbol", DataType::Utf8, false);
    let field_brstack = Field::new("brstack", DataType::Utf8, false);
    let field_brstacksym = Field::new("brstacksym", DataType::Utf8, false);
    let field_callchain = Field::new("callchain", DataType::Utf8, false);
    let field_ip = Field::new("ip", DataType::Utf8, false);
    let field_pid = Field::new("pid", DataType::Int64, false);
    let field_datasrc = Field::new("datasrc", DataType::Int64, false);
    let field_time = Field::new("time", DataType::Float64, false);
    let field_period = Field::new("period", DataType::Int64, false);
    let field_tid = Field::new("tid", DataType::Int64, false);
    let field_cpu = Field::new("cpu", DataType::Int64, false);
    let field_iregs = Field::new("iregs", DataType::Int64, false);
    let field_mapping_via = Field::new("mapping_via", DataType::Utf8, false);
    let field_dump_linenr = Field::new("dump_linenr", DataType::Int64, false);
    let field_pipeline = Field::new("pipeline", DataType::Utf8, false);
    let field_addr = Field::new("addr", DataType::Int64, false);
    let field_phys_addr = Field::new("phys_addr", DataType::Int64, false);
    let field_time_delta = Field::new("time_delta", DataType::Int64, false);

    let schema = Schema::new(vec![
        field_operator,
        field_uir_code,
        field_srcline,
        field_comm,
        field_dso,
        field_ev_name,
        field_symbol,
        field_brstack,
        field_brstacksym,
        field_callchain,
        field_ip,
        field_pid,
        field_datasrc,
        field_time,
        field_period,
        field_tid,
        field_cpu,
        field_iregs,
        field_mapping_via,
        field_dump_linenr,
        field_pipeline,
        field_addr,
        field_phys_addr,
        field_time_delta,
    ]);

    schema
}

// Init record batch of JavaScript
pub fn init_record_batches(
    file_size: i32,
    with_delimiter: u8,
    with_header: bool,
    with_projection: Vec<usize>,
) -> Vec<RecordBatch> {
    let schema = init_schema();

    let mut zip = zip::ZipArchive::new(WebFileReader::new_from_file(file_size)).unwrap();

    let names = zip.file_names();

    let parquet = zip.by_name("samples.parquet").unwrap(); 

    let reader = SerializedFileReader::new(parquet).unwrap();

    //let dict = zip.by_name("samples.parquet").unwrap(); 



    let mut vec = Vec::new();

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
