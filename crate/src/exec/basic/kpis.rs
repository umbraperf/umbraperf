use std::sync::Arc;

use arrow::{
    array::{Array, Float64Array},
    datatypes::DataType,
    record_batch::RecordBatch,
};

use crate::{exec::basic::filter, utils::{record_batch_util::create_new_record_batch, array_util::{get_stringarray_column, get_floatarray_column}}};


// Find maximal time in record batch
pub fn max_execution_time(batch: &RecordBatch, column_index_for_max: usize) -> RecordBatch {
    let vec = get_floatarray_column(batch, column_index_for_max);

    let mut result_builder = Float64Array::builder(1);
    let _result_builder = result_builder.append_value(if vec.len() > 0 {
        arrow::compute::max(vec).unwrap()
    } else {
        0.0
    });
    let result_builder = result_builder.finish();

    let batch = create_new_record_batch(
        vec!["count"],
        vec![DataType::Float64],
        vec![Arc::new(result_builder)],
    );

    batch
}

pub fn relative(
    batch: &RecordBatch,
    column_index_for_numerator: usize,
    column_index_for_denominator: usize,
) -> RecordBatch {
    let vec_de = get_stringarray_column(batch, column_index_for_denominator);
    let denominator = vec_de.len();

    let batch = filter::filter_with(column_index_for_numerator, vec!["No Operator"], batch);
    let vec_nom = get_stringarray_column(&batch, column_index_for_numerator);
    let numerator = vec_nom.len();

    let result = numerator as f64 / denominator as f64;
    let result = f64::trunc(result * 100.0) / 100.0;
    let mut result_builder = Float64Array::builder(1);
    let _result_builder = result_builder.append_value(result);
    let result_builder = result_builder.finish();

    let batch = create_new_record_batch(
        vec!["count"],
        vec![DataType::Float64],
        vec![Arc::new(result_builder)],
    );

    batch
}
