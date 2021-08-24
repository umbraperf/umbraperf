use std::{io::Cursor, sync::Arc};

use arrow::{array::{Int32Array, StringArray}, datatypes::{DataType, Field, Schema}, record_batch::RecordBatch};

use arrow::array::ArrayRef;

pub struct RecordBatchUtil {
}


impl RecordBatchUtil {

    pub fn create_record_batch_events(string_vec: Vec<Option<&str>>) -> RecordBatch {
        let event_array = StringArray::from(string_vec);
        let schema = Schema::new(vec![
        Field::new("event_name", DataType::Utf8, false),
        ]);

        let a: ArrayRef = Arc::new(event_array);

        let batch = RecordBatch::try_new(
        Arc::new(schema),
        vec![a]

        );

        batch.unwrap()
    }

    pub fn create_record_batch(string_vec: Vec<Option<&str>>, int_vec: Vec<i32>) -> RecordBatch {
        let operator_array = StringArray::from(string_vec);
        let cycles_array = Int32Array::from(int_vec);
        let schema = Schema::new(vec![
        Field::new("operator", DataType::Utf8, false),
        Field::new("cycles", DataType::Int32, false)
        ]);

        use arrow::array::ArrayRef;
        let a: ArrayRef = Arc::new(operator_array);
        let b: ArrayRef = Arc::new(cycles_array);


        let batch = RecordBatch::try_new(
        Arc::new(schema),
        vec![a, b]

        );

        batch.unwrap()
    }

    // Write Record Batch to IPC
    // return: Vec<u8> to send to JavaScript
    pub fn write_record_batch_to_cursor(record_batch: &RecordBatch) -> Cursor<Vec<u8>> {

        let mut buff = Cursor::new(vec![]);

        let options = arrow::ipc::writer::IpcWriteOptions::default();
        let mut dict = arrow::ipc::writer::DictionaryTracker::new(true);

        let encoded_schema = arrow::ipc::writer::IpcDataGenerator::schema_to_bytes(&arrow::ipc::writer::IpcDataGenerator::default(), &record_batch.schema(),  &options);
        let encoded_message = arrow::ipc::writer::IpcDataGenerator::encoded_batch(&arrow::ipc::writer::IpcDataGenerator::default(), &record_batch,  &mut dict, &options);

        arrow::ipc::writer::write_message(&mut buff, encoded_schema, &options);
        arrow::ipc::writer::write_message(&mut buff, encoded_message.unwrap().1, &options);

        buff
    }

}