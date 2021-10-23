use std::{collections::{HashMap, HashSet, hash_map}, sync::Arc};

use arrow::{array::{Array, Float64Array, LargeStringArray, StringArray}, datatypes::{DataType, Field, Schema}, ipc::{LargeUtf8Builder, Utf8, Utf8Builder}, record_batch::RecordBatch};

use crate::{
    exec::basic::analyze::{filter_with, find_unique_string},
    get_record_batches,
    utils::print_to_cons::print_to_js_with_obj,
};

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

pub fn count_rows_over_double(batch: &RecordBatch, column_pipeline: usize, column_operator: usize) -> RecordBatch {

    let vec_pipe = batch
        .column(column_pipeline)
        .as_any()
        .downcast_ref::<StringArray>()
        .unwrap();

    let vec_op = batch
        .column(column_operator)
        .as_any()
        .downcast_ref::<StringArray>()
        .unwrap();

    let mut hashmap: HashMap<&str,HashMap<&str,f64>> = HashMap::new();

    print_to_js_with_obj(&format!("{:?}", hashmap).into());

    let mut i = 0;
    while i < batch.column(0).len() {
        let current_pipe = vec_pipe.value(i);
        let current_op = vec_op.value(i);

        let inner_hashmap = hashmap.entry(current_pipe).or_insert(HashMap::new());
        inner_hashmap.entry(current_op).or_insert(0.);
        inner_hashmap.insert(current_op, inner_hashmap[current_op] + 1.);

        i += 1;
    }

    let mut pip_builder = Vec::new();
    let mut op_builder = Vec::new();
    let mut result_builder = Vec::new();

    for entry in hashmap {
        let mut total = 0.;
        for inner in entry.1 {
            let pipeline = entry.0;
            let operator = inner.0;
            let count = inner.1;
            pip_builder.push(pipeline);
            op_builder.push(operator);
            result_builder.push(count);
            total += inner.1; 
        }
        let pipeline = "inner";
        let operator = entry.0;
        let count = total;
        pip_builder.push(pipeline);
        op_builder.push(operator);
        result_builder.push(count);
    }

    let builder = Float64Array::from(result_builder);
    let pip_arr = StringArray::from(pip_builder);
    let op_arr = StringArray::from(op_builder);

    let field1 = Field::new("pipeline", DataType::Utf8, false);
    let field2 = Field::new("operator", DataType::Utf8, false);
    let result_field = Field::new("count", DataType::Float64, false);

    let schema = Schema::new(vec![field1, field2, result_field]);

    let batch = RecordBatch::try_new(Arc::new(schema), vec![Arc::new(pip_arr), Arc::new(op_arr), Arc::new(builder)]).unwrap(); 

    print_to_js_with_obj(&format!("{:?}", batch).into());

    return batch;

}

