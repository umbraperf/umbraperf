use std::io::Cursor;

use arrow::record_batch::RecordBatch;

use crate::bindings::notify_js_query_result;

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

    arrow::ipc::writer::write_message(&mut buff, encoded_schema, &options);
    arrow::ipc::writer::write_message(&mut buff, encoded_message.unwrap().1, &options);

    notify_js_query_result(buff.into_inner());
}
