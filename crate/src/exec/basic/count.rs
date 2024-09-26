use std::{
    collections::{HashMap, HashSet},
    sync::Arc,
};

use arrow::{
    array::{Array, Float64Array, StringArray},
    datatypes::DataType,
    record_batch::RecordBatch,
};

use crate::{
    exec::basic::basic::find_unique_string,
    state::state::{get_mapping_operator, get_unfiltered_record_batch},
    utils::{array_util::get_stringarray_column, record_batch_util::create_new_record_batch},
};

use super::op_mapping::init_mapping_operator;

// Count the number fields of a column
pub fn count(batch: &RecordBatch, col_to_count: usize) -> RecordBatch {

    // Init
    let col = get_stringarray_column(batch, col_to_count);
    let mut count_arr = Float64Array::builder(1);

    // Calc
    let row_count = col.len() as f64;

    // Finish
    let _result = count_arr.append_value(row_count);

    // Return
    create_new_record_batch(
        vec!["count"],
        vec![DataType::Float64],
        vec![Arc::new(count_arr.finish())],
    )
}

// Count the unique occ of a string column
pub fn count_unqiue(batch: &RecordBatch, col_for_unique: &usize) -> RecordBatch {

    // Init
    let vec = get_stringarray_column(batch, *col_for_unique);
    let mut count_arr = Float64Array::builder(1);

    // Calc
    let hash_set = vec
        .into_iter()
        .map(|item| item.unwrap())
        .collect::<HashSet<&str>>()
        .into_iter()
        .collect::<Vec<&str>>();

    // Finish
    let _result = count_arr.append_value(hash_set.len() as f64);

    // Return
    create_new_record_batch(
        vec!["count"],
        vec![DataType::Float64],
        vec![Arc::new(count_arr.finish())],
    )
}

// Group by column
pub fn group_by(batch: &RecordBatch, col_to_groupby: usize) -> RecordBatch {

    let mut hashmap: HashMap<&str, f64> = HashMap::new();
    let vec = get_stringarray_column(&batch, col_to_groupby);

    let unique_batch =
    find_unique_string(&get_unfiltered_record_batch().unwrap().batch, col_to_groupby);
    let unique_str = get_stringarray_column(&unique_batch, 0);

    for str in unique_str {
        hashmap.insert(str.unwrap(),0.0);
    }

    let mut i = 0;
    while i < batch.column(0).len() {
        let current_value = vec.value(i);
        hashmap.insert(current_value, hashmap[current_value] + 1.);
        i += 1;
    }

    let mut key_column = Vec::new();
    let mut value_column = Vec::new();

    for entry in hashmap {
        key_column.push(entry.0);
        value_column.push(entry.1);
    }

    create_new_record_batch(
        vec![batch.schema().field(col_to_groupby).name(), "count"],
        vec![DataType::Utf8, DataType::Float64],
        vec![
            Arc::new(StringArray::from(key_column)),
            Arc::new(Float64Array::from(value_column)),
        ],
    )

}

// Group by column with "nice" operator
pub fn group_by_with_nice_op(
    batch: &RecordBatch,
    col_to_groupby: usize,
) -> RecordBatch {

    let mut hashmap: HashMap<&str, f64> = HashMap::new();
    let vec = get_stringarray_column(&batch, col_to_groupby);

    let mut i = 0;
    while i < batch.column(0).len() {
        let current_value = vec.value(i);
        hashmap.entry(current_value).or_insert(0.);
        hashmap.insert(current_value, hashmap[current_value] + 1.);
        i += 1;
    }

    let mut key_column = Vec::new();
    let mut value_column = Vec::new();
    let mut op_extension_vec = Vec::new();

    init_mapping_operator();
    let mapping = get_mapping_operator();
    let map = mapping.lock().unwrap();

    for entry in hashmap {
        key_column.push(entry.0);
        value_column.push(entry.1);
        op_extension_vec.push(map.get(entry.0).unwrap().to_owned());
    }

    create_new_record_batch(
        vec![batch.schema().field(col_to_groupby).name(), "op_ext", "count"],
        vec![DataType::Utf8, DataType::Utf8, DataType::Float64],
        vec![
            Arc::new(StringArray::from(key_column)),
            Arc::new(StringArray::from(op_extension_vec)),
            Arc::new(Float64Array::from(value_column)),
        ],
    )

}

// Group by for two columns (Sunburst)
pub fn groupby_two_cols(
    batch: &RecordBatch,
    column_pipeline: usize,
    column_operator: usize,
) -> RecordBatch {

    // Init
    let vec_pipe = get_stringarray_column(batch, column_pipeline);
    let vec_op = get_stringarray_column(batch, column_operator);
    let mut hashmap: HashMap<&str, HashMap<&str, f64>> = HashMap::new();


    // Calc
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
    let mut pipecount = Vec::new();
    let mut opcount = Vec::new();

    for entry in hashmap {
        let mut total = 0.;
        for inner in entry.1 {
            let pipeline = entry.0;
            let operator = inner.0;
            let count = inner.1;
            pip_builder.push(pipeline);
            op_builder.push(operator);
            pipecount.push(0.);
            opcount.push(count);
            total += inner.1;
        }
        let pipeline = "inner";
        let operator = entry.0;
        let count = total;
        pip_builder.push(pipeline);
        op_builder.push(operator);
        pipecount.push(count);
        opcount.push(0.);
    }

    create_new_record_batch(
        vec!["pipeline", "operator", "pipecount", "opcount"],
        vec![
            DataType::Utf8,
            DataType::Utf8,
            DataType::Float64,
            DataType::Float64,
        ],
        vec![
            Arc::new(StringArray::from(pip_builder)),
            Arc::new(StringArray::from(op_builder)),
            Arc::new(Float64Array::from(pipecount)),
            Arc::new(Float64Array::from(opcount)),
        ],
    )
}
