use std::sync::Arc;

use arrow::{array::{Array, Float64Array, StringArray}, datatypes::{DataType, Field, Schema}, record_batch::RecordBatch};

use crate::exec::analyze::{self, filter_with, find_unique_string};

pub fn count_rows_over(batch: &RecordBatch, column_to_groupby_over: usize) -> RecordBatch {

    let unique_batch = find_unique_string(&batch, column_to_groupby_over);

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
        let group_batch = filter_with(column_to_groupby_over, group.unwrap(), batch);

        let row_count = group_batch.num_rows() as f64;

        result_builder.append_value(row_count);
    }

    let builder = result_builder.finish();

    let schema = batch.schema();
    let column_to_group_over_name = schema.field(column_to_groupby_over).name();
    // old_schema + new count field
    let field = Field::new(column_to_group_over_name, DataType::Utf8, false);
    let result_field = Field::new("count", DataType::Float64, false);

    let schema = Schema::new(vec![field, result_field]);

    let vec = unique_batch.column(0).to_owned();

    let batch = RecordBatch::try_new(Arc::new(schema), vec![vec, Arc::new(builder)]).unwrap();
    return analyze::sort_batch(&batch, 0);
}
