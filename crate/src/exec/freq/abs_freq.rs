use std::{collections::HashMap, sync::Arc};

use arrow::{
    array::{Float64Array, StringArray},
    datatypes::{DataType, Field, Schema},
    record_batch::RecordBatch,
};

use crate::{exec::basic::analyze::{find_unique_string, sort_batch}, utils::print_to_cons::print_to_js_with_obj};

pub fn create_abs_freq_bucket(
    record_batch: &RecordBatch,
    column_for_operator: usize,
    result_bucket: Vec<f64>,
    result_vec_operator: Vec<&str>,
    result_builder: Vec<f64>,
) -> RecordBatch {
    let builder_bucket = Float64Array::from(result_bucket);
    let operator_arr = StringArray::from(result_vec_operator);
    let builder_result = Float64Array::from(result_builder);

    // Record Batch
    let schema = record_batch.schema();
    let column_for_operator_name = schema.field(column_for_operator).name();

    let field_bucket = Field::new("bucket", DataType::Float64, false);
    let field_operator = Field::new(column_for_operator_name, DataType::Utf8, false);
    let result_field = Field::new("absfreq", DataType::Float64, false);

    let schema = Schema::new(vec![field_bucket, field_operator, result_field]);

    RecordBatch::try_new(
        Arc::new(schema),
        vec![
            Arc::new(builder_bucket),
            Arc::new(operator_arr),
            Arc::new(builder_result),
        ],
    )
    .unwrap()
}

pub fn abs_freq_of_event(
    batch: &RecordBatch,
    column_for_event: usize,
    column_for_time: usize,
    bucket_size: f64,
) -> RecordBatch {
    let batch = &sort_batch(batch, 2);

    let unique_event = find_unique_string(batch, column_for_event);

    // Vector of unique strings
    let vec_event = unique_event
        .column(0)
        .as_any()
        .downcast_ref::<StringArray>()
        .unwrap();

    let mut result_bucket = Vec::new();
    let mut result_vec_event = Vec::new();
    let mut result_builder = Vec::new();

    let mut time_bucket = bucket_size;
    let mut column_index = 0;

    let event_column = batch
        .column(column_for_event)
        .as_any()
        .downcast_ref::<StringArray>()
        .unwrap();
    let time_column = batch
        .column(column_for_time)
        .as_any()
        .downcast_ref::<Float64Array>()
        .unwrap();

    let mut bucket_map = HashMap::new();
    for event in vec_event {
        bucket_map.insert(event.unwrap(), 0.0);
    }

    bucket_map.insert("sum", 0.0);

    for time in time_column {
        let current_event = event_column.value(column_index as usize);
        while time_bucket < time.unwrap() {
            for event in vec_event {
                    let event = event.unwrap();
                    result_bucket.push((f64::trunc(time_bucket * 100.0) / 100.0) - bucket_size);
                    result_vec_event.push(event);
                    let frequenzy = bucket_map.get("sum").unwrap();
                    result_builder.push(frequenzy.to_owned());
                    // reset bucket_map
                    bucket_map.insert(event, 0.0);
            }

            // reset sum
            bucket_map.insert("sum", 0.0);
            time_bucket += bucket_size;
        }

        //if pipelines.contains(&current_pipeline) || pipelines.len() == 0 {
        bucket_map.insert(
            current_event,
            bucket_map.get(current_event).unwrap() + 1.0,
        );
        //}
        bucket_map.insert("sum", bucket_map.get("sum").unwrap() + 1.0);
        column_index += 1;
    }

    create_abs_freq_bucket(
        &batch,
        column_for_event,
        result_bucket,
        result_vec_event,
        result_builder,
    )
}

pub fn abs_freq_with_pipelines(
    batch: &RecordBatch,
    column_for_operator: usize,
    column_for_time: usize,
    bucket_size: f64,
    //pipelines: Vec<&str>,
) -> RecordBatch {
    let batch = &sort_batch(batch, 2);

    let unique_operator = find_unique_string(batch, column_for_operator);

    // Vector of unique strings
    let vec_operator = unique_operator
        .column(0)
        .as_any()
        .downcast_ref::<StringArray>()
        .unwrap();

    let mut result_bucket = Vec::new();
    let mut result_vec_operator = Vec::new();
    let mut result_builder = Vec::new();

    let mut time_bucket = bucket_size;
    let mut column_index = 0;

    let operator_column = batch
        .column(column_for_operator)
        .as_any()
        .downcast_ref::<StringArray>()
        .unwrap();
    let time_column = batch
        .column(column_for_time)
        .as_any()
        .downcast_ref::<Float64Array>()
        .unwrap();
    // TODO
    let pipeline_column = batch
        .column(3)
        .as_any()
        .downcast_ref::<StringArray>()
        .unwrap();

    let mut bucket_map = HashMap::new();
    for operator in vec_operator {
        bucket_map.insert(operator.unwrap(), 0.0);
    }

    bucket_map.insert("sum", 0.0);

    for time in time_column {
        let current_operator = operator_column.value(column_index as usize);
        let current_pipeline = pipeline_column.value(column_index as usize);
        while time_bucket < time.unwrap() {
            for operator in vec_operator {
                if bucket_map.get("sum").unwrap() > &0.0 {
                    let operator = operator.unwrap();
                    result_bucket.push((f64::trunc(time_bucket * 100.0) / 100.0) - bucket_size);
                    result_vec_operator.push(operator);
                    let frequenzy = bucket_map.get("sum").unwrap();
                    result_builder.push(frequenzy.to_owned());
                    // reset bucket_map
                    bucket_map.insert(operator, 0.0);
                }
            }

            // reset sum
            bucket_map.insert("sum", 0.0);
            while time_bucket < time.unwrap() {
                time_bucket += bucket_size;
            }
        }

        //if pipelines.contains(&current_pipeline) || pipelines.len() == 0 {
        bucket_map.insert(
            current_operator,
            bucket_map.get(current_operator).unwrap() + 1.0,
        );
        //}
        bucket_map.insert("sum", bucket_map.get("sum").unwrap() + 1.0);
        column_index += 1;
    }

    create_abs_freq_bucket(
        &batch,
        column_for_operator,
        result_bucket,
        result_vec_operator,
        result_builder,
    )
}
