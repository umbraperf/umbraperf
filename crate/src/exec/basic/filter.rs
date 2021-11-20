use arrow::{array::{ArrayRef, BooleanArray, Float64Array, Int32Array, StringArray}, record_batch::RecordBatch};

use crate::{
    exec::basic::basic::{find_unique_string, sort_batch},
    utils::record_batch_util::create_record_batch,
};

fn filter(column_num: usize, filter_strs: Vec<&str>, batch: &RecordBatch) -> RecordBatch {
    let filter_array = batch
        .column(column_num)
        .as_any()
        .downcast_ref::<StringArray>()
        .unwrap()
        .iter()
        .map(|value| Some(filter_strs.contains(&value.unwrap())))
        .collect::<BooleanArray>();

    let mut arrays: Vec<ArrayRef> = Vec::new();

    for idx in 0..batch.num_columns() {
        let array = batch.column(idx).as_ref();

        let filtered = arrow::compute::filter(array, &filter_array).unwrap();

        arrays.push(filtered);
    }

    create_record_batch(batch.schema(), arrays)
}

pub fn filter_with(column_num: usize, filter_strs: Vec<&str>, batch: &RecordBatch) -> RecordBatch {
    if filter_strs.len() == 1 && filter_strs[0] == "All" {
        return batch.to_owned();
    } else if filter_strs.len() == 1 && filter_strs[0] == "Default" {
        let unique_batch = find_unique_string(batch, 1);
        let unique_batch = sort_batch(&unique_batch, 0, false);
        let first_appearance = unique_batch
            .column(0)
            .as_any()
            .downcast_ref::<StringArray>()
            .unwrap();
        return filter(column_num, vec![first_appearance.value(0)], batch);
    } else {
        return filter(column_num, filter_strs, batch);
    }
}

pub fn filter_between(
    column_num: usize,
    filter_from: f64,
    filter_to: f64,
    batch: &RecordBatch,
) -> RecordBatch {
    if filter_from < 0.0 && filter_to < 0.0 {
        return batch.to_owned();
    }

    let filter_array = batch
        .column(column_num)
        .as_any()
        .downcast_ref::<Float64Array>()
        .unwrap()
        .iter()
        .map(|value| Some(value.unwrap() >= filter_from && value.unwrap() <= filter_to))
        .collect::<BooleanArray>();

    let mut arrays: Vec<ArrayRef> = Vec::new();

    for idx in 0..batch.num_columns() {
        let array = batch.column(idx).as_ref();

        let filtered = arrow::compute::filter(array, &filter_array).unwrap();

        arrays.push(filtered);
    }

    create_record_batch(batch.schema(), arrays)
}

pub fn filter_between_int32(
    column_num: usize,
    filter_from: i32,
    filter_to: i32,
    batch: &RecordBatch,
) -> RecordBatch {
    if filter_from < 0 && filter_to < 0 {
        return batch.to_owned();
    }

    let filter_array = batch
        .column(column_num)
        .as_any()
        .downcast_ref::<Int32Array>()
        .unwrap()
        .iter()
        .map(|value| Some(value.unwrap() >= filter_from && value.unwrap() <= filter_to))
        .collect::<BooleanArray>();

    let mut arrays: Vec<ArrayRef> = Vec::new();

    for idx in 0..batch.num_columns() {
        let array = batch.column(idx).as_ref();

        let filtered = arrow::compute::filter(array, &filter_array).unwrap();

        arrays.push(filtered);
    }

    create_record_batch(batch.schema(), arrays)
}
