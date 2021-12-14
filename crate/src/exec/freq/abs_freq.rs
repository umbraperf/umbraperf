use std::{collections::HashMap, sync::Arc};

use arrow::{
    array::{Float64Array, StringArray},
    datatypes::DataType,
    record_batch::RecordBatch,
};

use crate::{
    exec::basic::{
        basic::{find_unique_string, sort_batch},
        filter,
    },
    utils::{record_batch_util::create_new_record_batch, record_batch_schema::RecordBatchSchema},
};

use super::freq;

pub fn abs_freq_of_event(
    batch: &RecordBatch,
    column_for_event: usize,
    column_for_time: usize,
    bucket_size: f64,
) -> RecordBatch {
    let batch = &sort_batch(batch, RecordBatchSchema::Time as usize, false);

    let unique_event = find_unique_string(batch, column_for_event);

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

    let batch = create_new_record_batch(
        vec!["bucket", "absfreq"],
        vec![DataType::Float64, DataType::Float64],
        vec![
            Arc::new(Float64Array::from(result_bucket)),
            Arc::new(Float64Array::from(result_builder)),
        ],
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
    freq::freq_of_pipelines(
        batch,
        freq::Freq::ABS,
        column_for_operator,
        column_for_time,
        bucket_size,
        pipelines,
        operators,
        from,
        to,
    )
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
    to: f64,
) -> RecordBatch {
    let mut vec = Vec::new();
    vec.push(events[0]);
    let f_batch = filter::filter_with(RecordBatchSchema::EvName as usize, vec, batch);

    let (mut vec1, mut vec2, mut vec3, mut vec4, mut vec5, mut vec6) = (
        Vec::new(),
        Vec::new(),
        Vec::new(),
        Vec::new(),
        Vec::new(),
        Vec::new(),
    );

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
        .column(2)
        .as_any()
        .downcast_ref::<StringArray>()
        .unwrap();
    let column3 = first_filter_batch
        .column(3)
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
        .column(2)
        .as_any()
        .downcast_ref::<StringArray>()
        .unwrap();
    let column6 = second_filter_batch
        .column(3)
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

    create_new_record_batch(
        vec![
            "bucketNEG",
            "operatorNEG",
            "absfreqNEG",
            "bucket",
            "operator",
            "absfreq",
        ],
        vec![
            DataType::Float64,
            DataType::Utf8,
            DataType::Float64,
            DataType::Float64,
            DataType::Utf8,
            DataType::Float64,
        ],
        vec![
            Arc::new(Float64Array::from(vec1)),
            Arc::new(StringArray::from(vec2)),
            Arc::new(Float64Array::from(vec3)),
            Arc::new(Float64Array::from(vec4)),
            Arc::new(StringArray::from(vec5)),
            Arc::new(Float64Array::from(vec6)),
        ],
    )
}
