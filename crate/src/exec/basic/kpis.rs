use std::sync::Arc;

use arrow::{
    array::{Array, Float64Array, StringArray},
    datatypes::DataType,
    record_batch::RecordBatch,
};

use crate::{exec::basic::filter, utils::record_batch_util::create_new_record_batch};

pub fn max_execution_time(batch: &RecordBatch, column_index_for_max: usize) -> RecordBatch {
    let vec = batch
        .column(column_index_for_max)
        .as_any()
        .downcast_ref::<Float64Array>()
        .unwrap();

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
    let vec_de = batch
        .column(column_index_for_denominator)
        .as_any()
        .downcast_ref::<StringArray>()
        .unwrap();

    let denominator = vec_de.len();
    let batch = filter::filter_with(column_index_for_numerator, vec!["No Operator"], batch);

    let vec_nom = batch
        .column(column_index_for_numerator)
        .as_any()
        .downcast_ref::<StringArray>()
        .unwrap();

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
