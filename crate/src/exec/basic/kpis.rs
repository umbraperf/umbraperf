use std::sync::Arc;

use arrow::{
    array::{Array, Float64Array},
    datatypes::DataType,
    record_batch::RecordBatch,
};

use crate::{
    exec::basic::filter,
    utils::{
        array_util::{get_floatarray_column, get_stringarray_column},
        record_batch_util::create_new_record_batch,
    },
};

// Find maximal time in record batch
pub fn max_execution_time(batch: &RecordBatch, col_index_max: usize) -> RecordBatch {

    // Init
    let col = get_floatarray_column(batch, col_index_max);

    // Calc
    let mut count_arr = Float64Array::builder(1);
    let _result = count_arr.append_value(if col.len() > 0 {
        arrow::compute::max(col).unwrap()
    } else {
        0.0
    });

    // Return
    create_new_record_batch(
        vec!["count"],
        vec![DataType::Float64],
        vec![Arc::new(count_arr.finish())],
    )
}

pub fn relative(
    batch: &RecordBatch,
    col_i_for_num: usize,
    col_i_for_denom: usize,
) -> RecordBatch {
    let vec_de = get_stringarray_column(batch, col_i_for_denom);
    let denom = vec_de.len();

    let batch = filter::filter_with(col_i_for_num, vec!["No Operator"], batch);
    let vec_nom = get_stringarray_column(&batch, col_i_for_num);
    let num = vec_nom.len();

    let result = num as f64 / denom as f64;
    let result = f64::trunc(result * 100.0) / 100.0;
    let mut result_builder = Float64Array::builder(1);
    let _result_builder = result_builder.append_value(result);
    let result_builder = result_builder.finish();

    create_new_record_batch(
        vec!["count"],
        vec![DataType::Float64],
        vec![Arc::new(result_builder)],
    )
}
