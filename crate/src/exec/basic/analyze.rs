use arrow::error::Result as ArrowResult;
use arrow::{
    array::{Array, ArrayRef, BooleanArray, Float64Array, StringArray},
    compute::{sort_to_indices, take},
    datatypes::{DataType, Field, Schema},
    record_batch::RecordBatch,
};
use std::{collections::HashSet, sync::Arc};

use crate::utils::{print_to_cons::print_to_js_with_obj, record_batch_util::create_record_batch};

fn flatten<T>(nested: Vec<Vec<T>>) -> Vec<T> {
    nested.into_iter().flatten().collect()
}

pub fn concat_record_batches(vec_batch: Vec<RecordBatch>) -> RecordBatch {
    let mut vec_fields = Vec::new();
    let mut vec_columns = Vec::new();

    for batch in vec_batch {
        vec_fields.push(batch.schema().fields().to_owned());
        vec_columns.push(batch.columns().to_owned());
    }

    let fields = flatten::<Field>(vec_fields);
    let columns = flatten::<Arc<dyn Array>>(vec_columns);

    let schema = Schema::new(fields);
    let batch = RecordBatch::try_new(Arc::new(schema), columns);

    batch.unwrap()
}

pub fn select_columns(batch: RecordBatch, column_index: Vec<usize>) -> RecordBatch {
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

pub fn filter_between(
    column_num: usize,
    filter_from: f64,
    filter_to: f64,
    batch: &RecordBatch,
) -> RecordBatch {
    print_to_js_with_obj(&format!("{:?}", filter_from).into());
    print_to_js_with_obj(&format!("{:?}", filter_from < 0.0).into());

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

pub fn rename(record_batch: &RecordBatch, from: &str, to: &str) -> RecordBatch {
    let schema = record_batch.schema();
    let fields = schema.fields();

    let mut new_field_names = Vec::new();
    for field in fields {
        let name = field.name();
        if name == from {
            let new_field = Field::new(to, field.data_type().to_owned(), false);
            new_field_names.push(new_field);
        } else {
            new_field_names.push(field.to_owned());
        }
    }

    let new_schema = Arc::new(Schema::new(new_field_names));

    RecordBatch::try_new(new_schema, record_batch.columns().to_owned()).unwrap()
}

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
        let first_appearance = unique_batch.column(0).as_any().downcast_ref::<StringArray>().unwrap();
        return filter(column_num, vec![first_appearance.value(0)], batch);
    } else {
        return filter(column_num, filter_strs, batch);
    }
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

    let new_schema = Schema::new(vec![field.to_owned()]);

    let batch = RecordBatch::try_new(Arc::new(new_schema), vec![Arc::new(array)]).unwrap();
    return batch;
}

pub fn add_column(batch: &RecordBatch, string_to_add: &str, name_of_column: &str) -> RecordBatch {
    let batch_len = batch
        .column(0)
        .as_any()
        .downcast_ref::<StringArray>()
        .unwrap()
        .len();

    let mut vec_str = Vec::new();

    let mut i = 0;
    while i < batch_len {
        vec_str.push(string_to_add);
        i = i + 1;
    }

    let stri_arr = StringArray::from(vec_str);

    let result_field = Field::new(name_of_column, DataType::Utf8, false);

    let schema = Schema::new(vec![result_field]);

    let extra_batch = RecordBatch::try_new(Arc::new(schema), vec![Arc::new(stri_arr)]).unwrap();

    concat_record_batches(vec![batch.to_owned(), extra_batch])
}

pub fn add_column_float(
    batch: &RecordBatch,
    float_to_add: f64,
    name_of_column: &str,
) -> RecordBatch {
    let batch_len = batch
        .column(0)
        .as_any()
        .downcast_ref::<StringArray>()
        .unwrap()
        .len();

    let mut vec_str = Vec::new();

    let mut i = 0;
    while i < batch_len {
        vec_str.push(float_to_add);
        i = i + 1;
    }

    let stri_arr = Float64Array::from(vec_str);

    let result_field = Field::new(name_of_column, DataType::Float64, false);

    let schema = Schema::new(vec![result_field]);

    let extra_batch = RecordBatch::try_new(Arc::new(schema), vec![Arc::new(stri_arr)]).unwrap();

    concat_record_batches(vec![batch.to_owned(), extra_batch])
}

pub fn count_unique_string(batch: &RecordBatch, column_index_for_unqiue: usize) -> RecordBatch {
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

    let batch = RecordBatch::try_new(Arc::new(new_schema), vec![Arc::new(array)]).unwrap();
    return batch;
}
