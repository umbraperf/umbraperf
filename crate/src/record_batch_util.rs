use std::{io::Cursor, sync::Arc};

use arrow::record_batch::RecordBatch;

pub struct RecordBatchUtil {}

impl RecordBatchUtil {
    // Write Record Batch to IPC
    // return: Vec<u8> to send to JavaScript
    pub fn write_record_batch_to_cursor(record_batch: &RecordBatch) -> Cursor<Vec<u8>> {
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

        buff
    }

    pub fn write_record_batches_to_cursor(record_batches: Vec<RecordBatch>) -> Cursor<Vec<u8>> {
        let mut buff = Cursor::new(vec![]);

        for batch in record_batches {
            let mut buff = Cursor::new(vec![]);

            let options = arrow::ipc::writer::IpcWriteOptions::default();
            let mut dict = arrow::ipc::writer::DictionaryTracker::new(true);

            let encoded_schema = arrow::ipc::writer::IpcDataGenerator::schema_to_bytes(
                &arrow::ipc::writer::IpcDataGenerator::default(),
                &Arc::new(batch.schema()),
                &options,
            );
            let encoded_message = arrow::ipc::writer::IpcDataGenerator::encoded_batch(
                &arrow::ipc::writer::IpcDataGenerator::default(),
                &batch,
                &mut dict,
                &options,
            );
            arrow::ipc::writer::write_message(&mut buff, encoded_schema, &options);
            arrow::ipc::writer::write_message(&mut buff, encoded_message.unwrap().1, &options);
        }
        buff
    }
}
