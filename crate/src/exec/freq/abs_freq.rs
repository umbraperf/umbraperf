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
    utils::{record_batch_util::create_new_record_batch, record_batch_schema::RecordBatchSchema, array_util::{get_floatarray_column, get_stringarray_column}},
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

    let (mut bucket_vec, mut op_vec, mut freq_vec, mut bucket_vec_2, mut op_vec_2, mut freq_vec_2) = (
        Vec::new(),
        Vec::new(),
        Vec::new(),
        Vec::new(),
        Vec::new(),
        Vec::new(),
    );

    let batch_abs = abs_freq_of_pipelines(
        &f_batch,
        column_for_operator,
        column_for_time,
        bucket_size,
        pipelines.clone(),
        operators.clone(),
        from,
        to,
    );

    let bucket_col = get_floatarray_column(&batch_abs, 0);
    let op_col = get_stringarray_column(&batch_abs, 2);
    let freq_col = get_floatarray_column(&batch_abs,3);

    let mut i = 0;
    while i < bucket_col.len() {
        bucket_vec.push(bucket_col.value(i));
        op_vec.push(op_col.value(i));
        freq_vec.push(freq_col.value(i));
        bucket_vec_2.push(-1.0);
        op_vec_2.push("");
        freq_vec_2.push(0.0);
        i = i + 1;
    }

    let mut vec = Vec::new();

    vec.push(events[1]);

    let batch = filter::filter_with(1, vec, &batch);
    let batch_rel = abs_freq_of_pipelines(
        &batch,
        column_for_operator,
        column_for_time,
        bucket_size,
        pipelines,
        operators,
        from,
        to,
    );

    let bucket_col_2 = get_floatarray_column(&batch_rel, 0);
    let op_col_2 = get_stringarray_column(&batch_rel, 2);
    let freq_col_2 = get_floatarray_column(&batch_rel,3);

    let mut i = 0;
    while i < bucket_col_2.len() {
        bucket_vec.push(-1.0);
        op_vec.push("");
        freq_vec.push(0.0);
        bucket_vec_2.push(bucket_col_2.value(i));
        op_vec_2.push(op_col_2.value(i));
        freq_vec_2.push(freq_col_2.value(i));
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
            Arc::new(Float64Array::from(bucket_vec)),
            Arc::new(StringArray::from(op_vec)),
            Arc::new(Float64Array::from(freq_vec)),
            Arc::new(Float64Array::from(bucket_vec_2)),
            Arc::new(StringArray::from(op_vec_2)),
            Arc::new(Float64Array::from(freq_vec_2)),
        ],
    )
}
