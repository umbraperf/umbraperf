use arrow::{
    array::{
        Array, ArrayRef, BooleanArray, Float64Array, StringArray,
    },
    datatypes::{DataType, Field, Schema, SchemaRef},
    record_batch::RecordBatch,
};
use std::{
    collections::{HashMap, HashSet},
    sync::Arc,
};

fn create_record_batch(schema: SchemaRef, columns: Vec<ArrayRef>) -> RecordBatch {
    return RecordBatch::try_new(schema, columns).unwrap();
}

// Converts Vec<RecordBatch> to one whole RecordBatch
pub fn convert(batches: Vec<RecordBatch>) -> RecordBatch {
    let number_columns = batches[0].num_columns() as i32;

    let mut to_concat_array = Vec::new();

    for i in 0..number_columns {
        let mut array_vec = Vec::new();
        for batch in &batches {
            array_vec.push(batch.column(i as usize).as_ref());
        }
        to_concat_array.push(array_vec);
    }

    let mut columns = Vec::new();

    for array in to_concat_array {
        let concat_array = arrow::compute::kernels::concat::concat(&array);
        columns.push(concat_array.unwrap());
    }

    create_record_batch(batches[0].schema(), columns)
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

pub fn filter_with_number(
    column_num: usize,
    filter_float: f64,
    batch: &RecordBatch,
) -> RecordBatch {
    let filter_array = batch
        .column(column_num)
        .as_any()
        .downcast_ref::<Float64Array>()
        .unwrap()
        .iter()
        .map(|value| Some(value == Some(filter_float)))
        .collect::<BooleanArray>();

    let mut arrays: Vec<ArrayRef> = Vec::new();

    for idx in 0..batch.num_columns() {
        let array = batch.column(idx).as_ref();

        let filtered = arrow::compute::filter(array, &filter_array).unwrap();

        arrays.push(filtered);
    }

    create_record_batch(batch.schema(), arrays)
}


pub fn count_rows_over(batch: &RecordBatch, column_to_groupby_over: usize) -> RecordBatch {
    let unique_batch = find_unique_string(batch, column_to_groupby_over);

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

    RecordBatch::try_new(Arc::new(schema), vec![vec, Arc::new(builder)]).unwrap()
}

pub fn rel_freq_in_bucket_of_operators(
    batch: &RecordBatch,
    column_for_operator: usize,
    column_for_time: usize,
    bucket_size: f64,
) -> RecordBatch {
    let unique_operator = find_unique_string(batch, column_for_operator);

    // Vector of unique strings
    let vec_operator = unique_operator
        .column(0)
        .as_any()
        .downcast_ref::<StringArray>()
        .unwrap();

    // For each *unique* string there will be one result, therefore vec.len()
    let mut result_bucket = Vec::new();
    let mut result_vec_operator = Vec::new();
    let mut result_builder = Vec::new();

    let mut time_bucket = bucket_size;
    let mut column_index = 0;
    let operator_column = batch
        .column(column_for_operator)
        .as_any()
        .downcast_ref::<StringArray>()
        .unwrap();
    let time_column = batch
        .column(column_for_time)
        .as_any()
        .downcast_ref::<Float64Array>()
        .unwrap();

    let mut bucket_map = HashMap::new();
    for operator in vec_operator {
        bucket_map.insert(operator.unwrap(), 0.0);
    }
    bucket_map.insert("sum", 0.0);

    for time in time_column {
        let current_operator = operator_column.value(column_index as usize);
        bucket_map.insert(
            current_operator,
            bucket_map.get(current_operator).unwrap() + 1.0,
        );
        bucket_map.insert("sum", bucket_map.get("sum").unwrap() + 1.0);
        if time_bucket < time.unwrap() {
            for operator in vec_operator {
                if operator.unwrap() != "sum" && bucket_map.get("sum").unwrap() != &0.0 {
                    let operator = operator.unwrap();
                    result_bucket.push(f64::trunc(time_bucket * 100.0) / 100.0);
                    result_vec_operator.push(operator);
                    let frequenzy =
                        bucket_map.get(operator).unwrap() / bucket_map.get("sum").unwrap();
                    let frequenzy_rounded = f64::trunc(frequenzy * 100.0) / 100.0;
                    result_builder.push(frequenzy_rounded);
                    // reset bucket_map
                    bucket_map.insert(operator, 0.0);
                }
            }
            // reset sum
            bucket_map.insert("sum", 0.0);
            while time_bucket < time.unwrap() {
                time_bucket += bucket_size;
            }
        }
        column_index += 1;
    }

    let builder_bucket = Float64Array::from(result_bucket);
    let operator_arr = StringArray::from(result_vec_operator);
    let builder_result = Float64Array::from(result_builder);

    // Record Batch
    let schema = batch.schema();
    let column_for_operator_name = schema.field(column_for_operator).name();

    let field_bucket = Field::new("bucket", DataType::Float64, false);
    let field_operator = Field::new(column_for_operator_name, DataType::Utf8, false);
    let result_field = Field::new("relfreq", DataType::Float64, false);

    let schema = Schema::new(vec![field_bucket, field_operator, result_field]);

    RecordBatch::try_new(
        Arc::new(schema),
        vec![
            Arc::new(builder_bucket),
            Arc::new(operator_arr),
            Arc::new(builder_result),
        ],
    )
    .unwrap()
}


pub fn rel_freq_in_bucket_of_operators_helper(
    batch: &RecordBatch,
    column_for_operator: usize,
    column_for_time: usize,
    bucket_size: f64,
    pipeline: &str
) -> RecordBatch {
    let unique_operator = find_unique_string(batch, column_for_operator);

    // Vector of unique strings
    let vec_operator = unique_operator
        .column(0)
        .as_any()
        .downcast_ref::<StringArray>()
        .unwrap();

    // For each *unique* string there will be one result, therefore vec.len()
    let mut result_bucket = Vec::new();
    let mut result_vec_operator = Vec::new();
    let mut result_builder = Vec::new();

    let mut time_bucket = bucket_size;
    let mut column_index = 0;
    let operator_column = batch
        .column(column_for_operator)
        .as_any()
        .downcast_ref::<StringArray>()
        .unwrap();
    let time_column = batch
        .column(column_for_time)
        .as_any()
        .downcast_ref::<Float64Array>()
        .unwrap();
    // TODO
    let pipeline_column = batch
        .column(3)
        .as_any()
        .downcast_ref::<StringArray>()
        .unwrap();

    let mut bucket_map = HashMap::new();
    for operator in vec_operator {
        bucket_map.insert(operator.unwrap(), 0.0);
    }
    bucket_map.insert("sum", 0.0);

    for time in time_column {
        let current_operator = operator_column.value(column_index as usize);
        let current_pipeline = pipeline_column.value(column_index as usize);

        if pipeline == current_pipeline {
        bucket_map.insert(
            current_operator,
            bucket_map.get(current_operator).unwrap() + 1.0,
        );
    }
        bucket_map.insert("sum", bucket_map.get("sum").unwrap() + 1.0);
        if time_bucket < time.unwrap() {
            for operator in vec_operator {
                if operator.unwrap() != "sum" && bucket_map.get("sum").unwrap() != &0.0 {
                    let operator = operator.unwrap();
                    result_bucket.push(f64::trunc(time_bucket * 100.0) / 100.0);
                    result_vec_operator.push(operator);
                    let frequenzy =
                        bucket_map.get(operator).unwrap() / bucket_map.get("sum").unwrap();
                    let frequenzy_rounded = f64::trunc(frequenzy * 100.0) / 100.0;
                    result_builder.push(frequenzy_rounded);
                    // reset bucket_map
                    bucket_map.insert(operator, 0.0);
                }
            }
            // reset sum
            bucket_map.insert("sum", 0.0);
            while time_bucket < time.unwrap() {
                time_bucket += bucket_size;
            }
        }
        column_index += 1;
    }

    let builder_bucket = Float64Array::from(result_bucket);
    let operator_arr = StringArray::from(result_vec_operator);
    let builder_result = Float64Array::from(result_builder);

    // Record Batch
    let schema = batch.schema();
    let column_for_operator_name = schema.field(column_for_operator).name();

    let field_bucket = Field::new("bucket", DataType::Float64, false);
    let field_operator = Field::new(column_for_operator_name, DataType::Utf8, false);
    let result_field = Field::new("relfreq", DataType::Float64, false);

    let schema = Schema::new(vec![field_bucket, field_operator, result_field]);

    RecordBatch::try_new(
        Arc::new(schema),
        vec![
            Arc::new(builder_bucket),
            Arc::new(operator_arr),
            Arc::new(builder_result),
        ],
    )
    .unwrap()
}

pub fn rel_freq_in_bucket_of_operators_with_pipelines(
    batch: &RecordBatch,
    column_for_operator: usize,
    column_for_time: usize,
    column_for_pipeline: usize,
    bucket_size: f64
) -> Vec<RecordBatch> {
    let mut vec = Vec::new();

    let unique_pipelines = find_unique_string(batch, column_for_pipeline);

    let pipeline_vec = unique_pipelines
        .column(0)
        .as_any()
        .downcast_ref::<StringArray>()
        .unwrap();

    for pipeline in pipeline_vec {
        // let batch_with_pipeline_filter = filter_with(column_for_pipeline, pipeline.unwrap(), batch);
        let output_batch = rel_freq_in_bucket_of_operators_helper(
            &batch,
            column_for_operator,
            column_for_time,
            bucket_size,
            pipeline.unwrap()
        );

        vec.push(output_batch.to_owned());
    }

    vec
}

pub fn rel_freq_in_bucket_of_operators_with_pipeline(
    batch: &RecordBatch,
    column_for_operator: usize,
    column_for_time: usize,
    with_pipelines: Vec<&str>,
    bucket_size: f64
) -> Vec<RecordBatch> {
    let mut vec = Vec::new();

    for pipeline in with_pipelines {
        // let batch_with_pipeline_filter = filter_with(column_for_pipeline, pipeline.unwrap(), batch);
        let output_batch = rel_freq_in_bucket_of_operators_helper(
            &batch,
            column_for_operator,
            column_for_time,
            bucket_size,
            pipeline
        );

        vec.push(output_batch.to_owned());
    }

    vec
}



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



pub fn find_unique_numbers(batch: &RecordBatch, column_index_for_unqiue: usize) -> RecordBatch {
    let vec = batch
        .column(column_index_for_unqiue)
        .as_any()
        .downcast_ref::<Float64Array>()
        .unwrap();
    let mut str_vec = Vec::new();
    for item in vec {
        if let Some(x) = item {
            str_vec.push(x);
        }
    }

    str_vec.sort_by_key(|k| (k * 100.0) as i64);

    str_vec.dedup();

    let array = Float64Array::from(str_vec);

    let schema = batch.schema();

    let field = schema.field(column_index_for_unqiue);

    let new_schema = Schema::new(vec![field.to_owned()]);

    RecordBatch::try_new(Arc::new(new_schema), vec![Arc::new(array)]).unwrap()
}
