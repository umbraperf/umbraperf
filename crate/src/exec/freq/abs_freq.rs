use std::{collections::HashMap, sync::Arc};

use arrow::{
    array::{Float64Array, StringArray},
    datatypes::DataType,
    record_batch::RecordBatch,
};

use crate::{
    exec::basic::filter,
    utils::{
        array_util::{get_floatarray_column, get_stringarray_column},
        record_batch_schema::RecordBatchSchema,
        record_batch_util::create_new_record_batch,
    },
};

use super::freq;

pub fn abs_freq_of_event(
    batch: &RecordBatch,
    _event_col: usize,
    time_col: usize,
    bucket_size: f64,
) -> RecordBatch {

    let mut result_time_bucket = Vec::new();
    let mut result_freq = Vec::new();

    let mut time_bucket = bucket_size;
    let time_column = get_floatarray_column(&batch, time_col);

    let mut bucket_map = HashMap::new();
    bucket_map.insert("sum", 0.0);

    for (i, time) in time_column.into_iter().enumerate() {

        while time_bucket < time.unwrap() {
            result_time_bucket.push((f64::trunc(time_bucket * 100.0) / 100.0) - bucket_size);
            let frequenzy = bucket_map.get("sum").unwrap();
            result_freq.push(frequenzy.to_owned());
            // Reset
            bucket_map.insert("sum", 0.0);
            time_bucket += bucket_size;
        }

        bucket_map.insert("sum", bucket_map.get("sum").unwrap() + 1.0);

        if i == time_column.len() - 1 {
            result_time_bucket.push((f64::trunc(time_bucket * 100.0) / 100.0) - bucket_size);
            let frequenzy = bucket_map.get("sum").unwrap();
            result_freq.push(frequenzy.to_owned());

        }
    }

    let batch = create_new_record_batch(
        vec!["bucket", "absfreq"],
        vec![DataType::Float64, DataType::Float64],
        vec![
            Arc::new(Float64Array::from(result_time_bucket)),
            Arc::new(Float64Array::from(result_freq)),
        ],
    );

    batch
}

pub fn abs_freq_operators(
    batch: &RecordBatch,
    column_for_operator: usize,
    column_for_time: usize,
    bucket_size: f64,
    pipelines: Vec<&str>,
    operators: Vec<&str>,
    from: f64,
    to: f64,
) -> RecordBatch {
    freq::freq_of_operators(
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

pub fn abs_freq_operators_doub_event(
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
    let (
        mut bucket_vec,
        mut op_vec,
        mut nice_op_vec,
        mut freq_vec,
        mut bucket_vec_2,
        mut op_vec_2,
        mut nice_op_vec_2,
        mut freq_vec_2,
    ) = (
        Vec::new(),
        Vec::new(),
        Vec::new(),
        Vec::new(),
        Vec::new(),
        Vec::new(),
        Vec::new(),
        Vec::new(),
    );

    let f_batch = filter::filter_with(RecordBatchSchema::EvName as usize, vec![events[0]], batch);

    let batch_abs = abs_freq_operators(
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
    let nice_op_col = get_stringarray_column(&batch_abs, 1);
    let freq_col = get_floatarray_column(&batch_abs, 3);

    let mut i = 0;
    while i < bucket_col.len() {
        bucket_vec.push(bucket_col.value(i));
        op_vec.push(op_col.value(i));
        nice_op_vec.push(nice_op_col.value(i));
        freq_vec.push(freq_col.value(i));
        bucket_vec_2.push(-1.0);
        op_vec_2.push("");
        nice_op_vec_2.push("");
        freq_vec_2.push(0.0);
        i = i + 1;
    }

    let batch = filter::filter_with(RecordBatchSchema::EvName as usize, vec![events[1]], &batch);
    let batch_rel = abs_freq_operators(
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
    let nice_op_col_2 = get_stringarray_column(&batch_rel, 1);
    let freq_col_2 = get_floatarray_column(&batch_rel, 3);

    let mut i = 0;
    while i < bucket_col_2.len() {
        bucket_vec.push(-1.0);
        op_vec.push("");
        nice_op_vec.push("");
        freq_vec.push(0.0);
        bucket_vec_2.push(bucket_col_2.value(i));
        op_vec_2.push(op_col_2.value(i));
        nice_op_vec_2.push(nice_op_col_2.value(i));
        freq_vec_2.push(freq_col_2.value(i));
        i = i + 1;
    }

    create_new_record_batch(
        vec![
            "bucketNEG",
            "op_extNEG",
            "operatorNEG",
            "absfreqNEG",
            "bucket",
            "op_ext",
            "operator",
            "absfreq",
        ],
        vec![
            DataType::Float64,
            DataType::Utf8,
            DataType::Utf8,
            DataType::Float64,
            DataType::Float64,
            DataType::Utf8,
            DataType::Utf8,
            DataType::Float64,
        ],
        vec![
            Arc::new(Float64Array::from(bucket_vec)),
            Arc::new(StringArray::from(nice_op_vec)),
            Arc::new(StringArray::from(op_vec)),
            Arc::new(Float64Array::from(freq_vec)),
            Arc::new(Float64Array::from(bucket_vec_2)),
            Arc::new(StringArray::from(nice_op_vec_2)),
            Arc::new(StringArray::from(op_vec_2)),
            Arc::new(Float64Array::from(freq_vec_2)),
        ],
    )
}
