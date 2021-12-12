use arrow::error::Result as ArrowResult;
use arrow::{
    array::{ArrayRef, StringArray},
    compute::{sort_to_indices, take},
    datatypes::Schema,
    record_batch::RecordBatch,
};
use std::{collections::HashSet, sync::Arc};

use crate::utils::record_batch_util::create_new_record_batch;
use crate::utils::record_batch_util::create_record_batch;


// Specify Vec to "SELECT" those columns
pub fn select_columns(batch: RecordBatch, columns_to_select: Vec<usize>) -> RecordBatch {
    let mut vec = Vec::new();
    for index in &columns_to_select {
        let array = batch.column(*index).to_owned();

        vec.push(array);
    }
    let mut fields = Vec::new();
    let old_schema = batch.schema();
    for index in &columns_to_select {
        fields.push(old_schema.field(*index).to_owned());
    }
    let new_schema = Schema::new(fields);
    create_record_batch(Arc::new(new_schema), vec)
}

// "SORT BY" for record batch with descending option
pub fn sort_batch(
    batch: &RecordBatch,
    column_for_sort: usize,
    descending: bool,
) -> RecordBatch {
    let options = arrow::compute::SortOptions {
        descending: descending,
        nulls_first: false,
    };

    let sorted_array_of_indices = sort_to_indices(batch.column(column_for_sort), Some(options), None).unwrap();

    RecordBatch::try_new(
        batch.schema(),
        batch
            .columns()
            .iter()
            .map(|column| take(column.as_ref(), &sorted_array_of_indices, None))
            .collect::<ArrowResult<Vec<ArrayRef>>>()
            .unwrap(),
    )
    .unwrap()
}

// UNIQUE for specified column
pub fn find_unique_string(batch: &RecordBatch, column_for_unique: usize) -> RecordBatch {
    let column = batch
        .column(column_for_unique)
        .as_any()
        .downcast_ref::<StringArray>()
        .unwrap();

    let hash_set = column
        .into_iter()
        .map(|item| item.unwrap())
        .collect::<HashSet<&str>>()
        .into_iter()
        .collect::<Vec<&str>>();

    let string_arr = StringArray::from(hash_set);

    let schema = batch.schema();
    let field = schema.field(column_for_unique);
    let batch = create_new_record_batch(
        vec![field.name()],
        vec![field.data_type().to_owned()],
        vec![Arc::new(string_arr)],
    );

    return batch;
}
