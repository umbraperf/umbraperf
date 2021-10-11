use std::{collections::HashSet, sync::Arc};

use arrow::{array::{Array, Float64Array, StringArray}, datatypes::{DataType, Field, Schema}, record_batch::RecordBatch};

use crate::{exec::basic::analyze::{filter_with, find_unique_string}, get_record_batches, utils::print_to_cons::print_to_js_with_obj};

use super::analyze;

pub fn count(batch: &RecordBatch, column_to_count: usize) -> RecordBatch {

    let vec = batch
        .column(column_to_count)
        .as_any()
        .downcast_ref::<StringArray>()
        .unwrap();

    let mut result_builder = Float64Array::builder(1);

    let row_count = vec.len() as f64;
    let _result_builder = result_builder.append_value(row_count);

    let builder = result_builder.finish();

    let result_field = Field::new("count", DataType::Float64, false);

    let schema = Schema::new(vec![result_field]);

    let batch = RecordBatch::try_new(Arc::new(schema), vec![Arc::new(builder)]).unwrap();
    return batch;

}

pub fn count_total_unique(batch: &RecordBatch, column_index_for_unqiue: usize) -> RecordBatch {
    let vec = batch
        .column(column_index_for_unqiue)
        .as_any()
        .downcast_ref::<StringArray>()
        .unwrap();

    let hash_set = vec
        .into_iter()
        .map(|item| item.unwrap())
        .collect::<HashSet<&str>>()
        .into_iter()
        .collect::<Vec<&str>>();

    let mut result_builder = Float64Array::builder(1);
    let _result_builder = result_builder.append_value(hash_set.len() as f64);
    let builder = result_builder.finish();

    let result_field = Field::new("count", DataType::Float64, false);

    let schema = Schema::new(vec![result_field]);

    let batch = RecordBatch::try_new(Arc::new(schema), vec![Arc::new(builder)]).unwrap();
    return batch;
}

pub fn count_rows_over(batch: &RecordBatch, column_to_groupby_over: usize) -> RecordBatch {

    let unique_batch = find_unique_string(&get_record_batches().unwrap(), column_to_groupby_over);

    // Vector of unique strings
    let vec = unique_batch
        .column(0)
        .as_any()
        .downcast_ref::<StringArray>()
        .unwrap();

    // For each *unique* string there will be one result, therefore vec.len()
    let mut result_builder = Float64Array::builder(vec.len());

    for group in vec {
        // Filter unique string as filter_str
        let mut filter_str = Vec::new();
        filter_str.push(group.unwrap());
        let group_batch = filter_with(column_to_groupby_over, filter_str, batch);

        let row_count = group_batch.num_rows() as f64;

        let _result_builder = result_builder.append_value(row_count);
    }

    let builder = result_builder.finish();

    let schema = batch.schema();
    let column_to_group_over_name = schema.field(column_to_groupby_over).name();
    let field = Field::new(column_to_group_over_name, DataType::Utf8, false);
    let result_field = Field::new("count", DataType::Float64, false);

    let schema = Schema::new(vec![field, result_field]);

    let vec = unique_batch.column(0).to_owned();

    let batch = RecordBatch::try_new(Arc::new(schema), vec![vec, Arc::new(builder)]).unwrap();
    return batch;
}


pub fn max_execution_time(batch: &RecordBatch, column_index_for_max: usize) -> RecordBatch {

    print_to_js_with_obj(&format!("{:?}", batch).into());


    print_to_js_with_obj(&format!("{:?}", "Before").into());


    let vec = batch
    .column(column_index_for_max)
    .as_any()
    .downcast_ref::<Float64Array>()
    .unwrap();

    print_to_js_with_obj(&format!("{:?}", "In Max function").into());

    let mut result_builder = Float64Array::builder(1);

    let _result_builder = result_builder.append_value(if vec.len() > 0 { arrow::compute::max(vec).unwrap() } else  { 0.0 });
    let result_builder = result_builder.finish();

    let result_field = Field::new("count", DataType::Float64, false);

    let schema = Schema::new(vec![result_field]);

    let batch = RecordBatch::try_new(Arc::new(schema), vec![Arc::new(result_builder)]).unwrap();

    print_to_js_with_obj(&format!("{:?}", batch).into());
    
    batch

}


pub fn relative(batch: &RecordBatch, column_index_for_numerator: usize, column_index_for_denominator: usize) -> RecordBatch {

    let vec_de = batch
    .column(column_index_for_denominator)
    .as_any()
    .downcast_ref::<StringArray>()
    .unwrap();

    let denominator = vec_de.len();

    let batch = analyze::filter_with(column_index_for_numerator, vec!["No Operator"], batch);

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

    let result_field = Field::new("count", DataType::Float64, false);

    let schema = Schema::new(vec![result_field]);

    let batch = RecordBatch::try_new(Arc::new(schema), vec![Arc::new(result_builder)]).unwrap();
    
    batch



}