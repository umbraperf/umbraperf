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
    exec::{basic::{basic::find_unique_string, filter::filter_with}, freq::freq::init_mapping_operator},
    state::state::{get_record_batches, get_mapping_operator},
    utils::{print_to_cons::print_to_js_with_obj, record_batch_util::create_new_record_batch},
};

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

    let batch = create_new_record_batch(
        vec!["count"],
        vec![DataType::Float64],
        vec![Arc::new(builder)],
    );

    return batch;
}

pub fn count_total_unique(batch: &RecordBatch, column_index_for_unqiue: &usize) -> RecordBatch {
    let vec = batch
        .column(*column_index_for_unqiue)
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

    let batch = create_new_record_batch(
        vec!["count"],
        vec![DataType::Float64],
        vec![Arc::new(builder)],
    );

    return batch;
}

pub fn count_rows_over(batch: &RecordBatch, column_to_groupby_over: usize) -> RecordBatch {
    //count_rows_over_with_mapping(&batch, column_to_groupby_over);

    let unique_batch =
        find_unique_string(&get_record_batches().unwrap().batch, column_to_groupby_over);

    let vec = unique_batch
        .column(0)
        .as_any()
        .downcast_ref::<StringArray>()
        .unwrap();

    let mut result_builder = Float64Array::builder(vec.len());

    for group in vec {
        let group_batch = filter_with(column_to_groupby_over, vec![group.unwrap()], batch);

        let row_count = group_batch.num_rows() as f64;

        let _result_builder = result_builder.append_value(row_count);
    }

    let builder = result_builder.finish();
    let batch = create_new_record_batch(
        vec![batch.schema().field(column_to_groupby_over).name(), "count"],
        vec![DataType::Utf8, DataType::Float64],
        vec![unique_batch.column(0).to_owned(), Arc::new(builder)],
    );

    return batch;
}

pub fn count_rows_over_with_mapping(
    batch: &RecordBatch,
    column_to_groupby_over: usize,
) -> RecordBatch {
    let unique_batch =
        find_unique_string(&get_record_batches().unwrap().batch, column_to_groupby_over);

    let vec = unique_batch
        .column(0)
        .as_any()
        .downcast_ref::<StringArray>()
        .unwrap();

    let mut result_builder = Float64Array::builder(vec.len());
    let mut op_extension_vec = Vec::new();
    let mut pyhsical_vec = Vec::new();

    for group in vec {
        let group_batch = filter_with(column_to_groupby_over, vec![group.unwrap()], batch);
        let row_count = group_batch.num_rows() as f64;

        let pyhsical_vec_col = group_batch
            .column(7)
            .as_any()
            .downcast_ref::<StringArray>()
            .unwrap();

        init_mapping_operator();
        let mapping =  get_mapping_operator();
        let map = mapping.lock().unwrap();
        pyhsical_vec.push(pyhsical_vec_col.value(0).to_owned());
        op_extension_vec.push(map.get(group.unwrap()).unwrap().to_owned());
        let _result_builder = result_builder.append_value(row_count);
    }

    let builder = result_builder.finish();

    let batch = create_new_record_batch(
        vec![
            batch.schema().field(column_to_groupby_over).name(),
            "op_ext",
            "physical_op",
            "count",
        ],
        vec![
            DataType::Utf8,
            DataType::Utf8,
            DataType::Utf8,
            DataType::Float64,
        ],
        vec![
            unique_batch.column(0).to_owned(),
            Arc::new(StringArray::from(op_extension_vec)),
            Arc::new(StringArray::from(pyhsical_vec)),
            Arc::new(builder),
        ],
    );

    print_to_js_with_obj(&format!("{:?}", batch).into());

    return batch;
}

pub fn count_rows_over_double(
    batch: &RecordBatch,
    column_pipeline: usize,
    column_operator: usize,
) -> RecordBatch {
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

    let mut hashmap: HashMap<&str, HashMap<&str, f64>> = HashMap::new();

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

    let pip_arr = StringArray::from(pip_builder);
    let op_arr = StringArray::from(op_builder);
    let builder_pipe = Float64Array::from(pipecount);
    let builder_op = Float64Array::from(opcount);

    let batch = create_new_record_batch(
        vec!["pipeline", "operator", "pipecount", "opcount"],
        vec![
            DataType::Utf8,
            DataType::Utf8,
            DataType::Float64,
            DataType::Float64,
        ],
        vec![
            Arc::new(pip_arr),
            Arc::new(op_arr),
            Arc::new(builder_pipe),
            Arc::new(builder_op),
        ],
    );

    return batch;
}
