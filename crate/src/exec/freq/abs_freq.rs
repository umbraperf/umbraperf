use std::{collections::HashMap, sync::Arc};

use arrow::{
    array::{Float64Array, StringArray},
    datatypes::{DataType, Field, Schema},
    record_batch::RecordBatch,
};

use crate::{exec::{basic::{
        basic::{find_unique_string, sort_batch},
        filter,
    }, freq::freq::create_freq_bucket}};

use super::freq;

pub fn abs_freq_of_event(
    batch: &RecordBatch,
    column_for_event: usize,
    column_for_time: usize,
    bucket_size: f64,
) -> RecordBatch {
    let batch = &sort_batch(batch, 2, false);

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

    for (i, time) in time_column.into_iter().enumerate() {
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

        bucket_map.insert(current_event, bucket_map.get(current_event).unwrap() + 1.0);

        bucket_map.insert("sum", bucket_map.get("sum").unwrap() + 1.0);

        if i == time_column.len() - 1 {
            for event in vec_event {
                let event = event.unwrap();
                result_bucket.push((f64::trunc(time_bucket * 100.0) / 100.0) - bucket_size);
                result_vec_event.push(event);
                let frequenzy = bucket_map.get("sum").unwrap();
                result_builder.push(frequenzy.to_owned());
            }
        }

        column_index += 1;
    }

    let batch = create_freq_bucket(
        &batch,
        column_for_event,
        result_bucket,
        result_vec_event,
        result_builder,
        freq::Freq::ABS
    );

    batch
}

pub fn abs_freq_of_pipelines(
    batch: &RecordBatch,
    column_for_operator: usize,
    column_for_time: usize,
    bucket_size: f64,
    pipelines: Vec<&str>,
    operators: Vec<&str>,
    from: f64,
    to: f64,
) -> RecordBatch {

    freq::freq_of_pipelines(batch, freq::Freq::ABS, column_for_operator, column_for_time, bucket_size, pipelines, operators, from, to)
}

pub fn abs_freq_with_pipelines_with_double_events(
    batch: &RecordBatch,
    column_for_operator: usize,
    column_for_time: usize,
    bucket_size: f64,
    pipelines: Vec<&str>,
    operators: Vec<&str>,
    events: Vec<&str>,
    from: f64,
    to: f64
) -> RecordBatch {
    let mut vec = Vec::new();
    vec.push(events[0]);
    let f_batch = filter::filter_with(1, vec, batch);

    let mut vec1 = Vec::new();
    let mut vec2 = Vec::new();
    let mut vec3 = Vec::new();
    let mut vec4 = Vec::new();
    let mut vec5 = Vec::new();
    let mut vec6 = Vec::new();

    let first_filter_batch = abs_freq_of_pipelines(
        &f_batch,
        column_for_operator,
        column_for_time,
        bucket_size,
        pipelines.clone(),
        operators.clone(),
        from,
        to,
    );

    let column1 = first_filter_batch
        .column(0)
        .as_any()
        .downcast_ref::<Float64Array>()
        .unwrap();
    let column2 = first_filter_batch
        .column(1)
        .as_any()
        .downcast_ref::<StringArray>()
        .unwrap();
    let column3 = first_filter_batch
        .column(2)
        .as_any()
        .downcast_ref::<Float64Array>()
        .unwrap();

    let mut i = 0;
    while i < column1.len() {
        vec1.push(column1.value(i));
        vec2.push(column2.value(i));
        vec3.push(column3.value(i));
        vec4.push(-1.0);
        vec5.push("");
        vec6.push(0.0);
        i = i + 1;
    }

    let mut vec = Vec::new();

    vec.push(events[1]);

    let batch = filter::filter_with(1, vec, &batch);
    let second_filter_batch = abs_freq_of_pipelines(
        &batch,
        column_for_operator,
        column_for_time,
        bucket_size,
        pipelines,
        operators,
        from,
        to,
    );

    let column4 = second_filter_batch
        .column(0)
        .as_any()
        .downcast_ref::<Float64Array>()
        .unwrap();
    let column5 = second_filter_batch
        .column(1)
        .as_any()
        .downcast_ref::<StringArray>()
        .unwrap();
    let column6 = second_filter_batch
        .column(2)
        .as_any()
        .downcast_ref::<Float64Array>()
        .unwrap();

    let mut i = 0;
    while i < column4.len() {
        vec1.push(-1.0);
        vec2.push("");
        vec3.push(0.0);
        vec4.push(column4.value(i));
        vec5.push(column5.value(i));
        vec6.push(column6.value(i));
        i = i + 1;
    }

    let field1 = Field::new("bucket", DataType::Float64, false);
    let field2 = Field::new("operator", DataType::Utf8, false);
    let field3 = Field::new("absfreq", DataType::Float64, false);
    let field4 = Field::new("bucketNEG", DataType::Float64, false);
    let field5 = Field::new("operatorNEG", DataType::Utf8, false);
    let field6 = Field::new("absfreqNEG", DataType::Float64, false);

    let schema = Schema::new(vec![field1, field2, field3, field4, field5, field6]);

    let vec1 = Float64Array::from(vec1);
    let vec2 = StringArray::from(vec2);
    let vec3 = Float64Array::from(vec3);
    let vec4 = Float64Array::from(vec4);
    let vec5 = StringArray::from(vec5);
    let vec6 = Float64Array::from(vec6);

    let batch = RecordBatch::try_new(
        Arc::new(schema),
        vec![
            Arc::new(vec1),
            Arc::new(vec2),
            Arc::new(vec3),
            Arc::new(vec4),
            Arc::new(vec5),
            Arc::new(vec6),
        ],
    );

    batch.unwrap()
}
