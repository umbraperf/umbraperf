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

pub fn sort_batch(
    batch: &RecordBatch,
    column_index_to_sort: usize,
    descending: bool,
) -> RecordBatch {
    let options = arrow::compute::SortOptions {
        descending: descending,
        nulls_first: false,
    };

    let indices = sort_to_indices(batch.column(column_index_to_sort), Some(options), None).unwrap();

    RecordBatch::try_new(
        batch.schema(),
        batch
            .columns()
            .iter()
            .map(|column| take(column.as_ref(), &indices, None))
            .collect::<ArrowResult<Vec<ArrayRef>>>()
            .unwrap(),
    )
    .unwrap()
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
    let batch = create_new_record_batch(
        vec![field.name()],
        vec![field.data_type().to_owned()],
        vec![Arc::new(array)],
    );

    return batch;
}
