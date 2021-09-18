use arrow::{array::{Array, ArrayRef, BooleanArray, Float64Array, StringArray}, compute::{take, sort_to_indices}, datatypes::{DataType, Field, Schema, SchemaRef}, record_batch::RecordBatch};
use std::{
    collections::{HashMap, HashSet},
    sync::Arc,
};
use arrow::error::Result as ArrowResult;

use crate::utils::{print_to_cons::print_to_js_with_obj, record_batch_util::create_record_batch};

pub fn get_columns(batch: RecordBatch, column_index: Vec<usize>) -> RecordBatch {
    let mut vec = Vec::new();

    for index in &column_index {
        let array = batch.column(*index).to_owned();

        vec.push(array);
    }

    let mut fields = Vec::new();
    let old_schema = batch.schema();

    for index in &column_index {
        fields.push(old_schema.field(*index).to_owned());
    }

    let new_schema = Schema::new(fields);

    create_record_batch(Arc::new(new_schema), vec)
}


pub fn filter_with(column_num: usize, filter_str: &str, batch: &RecordBatch) -> RecordBatch {
    let filter_array = batch
        .column(column_num)
        .as_any()
        .downcast_ref::<StringArray>()
        .unwrap()
        .iter()
        .map(|value| Some(value == Some(filter_str)))
        .collect::<BooleanArray>();

    let mut arrays: Vec<ArrayRef> = Vec::new();

    for idx in 0..batch.num_columns() {
        let array = batch.column(idx).as_ref();

        let filtered = arrow::compute::filter(array, &filter_array).unwrap();

        arrays.push(filtered);
    }

    create_record_batch(batch.schema(), arrays)
}
 
pub fn sort_batch(batch: &RecordBatch, column_index_to_sort: usize) -> RecordBatch {

    // if data_type == DataType::Utf8 {
    let options = arrow::compute::SortOptions{
        descending: false,
        nulls_first: false,
    };

    let indices = sort_to_indices(batch.column(column_index_to_sort), Some(options), None).unwrap();

    RecordBatch::try_new(
        batch.schema(),batch
            .columns()
            .iter()
            .map(|column| take(column.as_ref(), &indices, None))
            .collect::<ArrowResult<Vec<ArrayRef>>>().unwrap(),
    ).unwrap()
    
}

pub fn find_unique_string(batch: &RecordBatch, column_index_for_unqiue: usize) -> RecordBatch {
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

    let array = StringArray::from(hash_set);

    let schema = batch.schema();

    let field = schema.field(column_index_for_unqiue);

    let new_schema = Schema::new(vec![field.to_owned()]);

    RecordBatch::try_new(Arc::new(new_schema), vec![Arc::new(array)]).unwrap()
}
