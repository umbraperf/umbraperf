use std::{collections::HashMap, sync::Arc};

use arrow::{array::{Float64Array, StringArray}, datatypes::{DataType, Field, Schema}, record_batch::RecordBatch};

use crate::{exec::analyze::{find_unique_string, sort_batch}, utils::print_to_cons::print_to_js_with_obj};



pub fn rel_freq_in_bucket_of_operators_helper(
    batch: &RecordBatch,
    column_for_operator: usize,
    column_for_time: usize,
    bucket_size: f64,
    pipeline: &str,
) -> RecordBatch {

    let batch = &sort_batch(batch, 2);

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
        while time_bucket < time.unwrap() {
            for operator in vec_operator {
                if bucket_map.get("sum").unwrap() > &0.0 {
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

        if pipeline == current_pipeline {
            bucket_map.insert(
                current_operator,
                bucket_map.get(current_operator).unwrap() + 1.0,
            );
        }
        bucket_map.insert("sum", bucket_map.get("sum").unwrap() + 1.0);
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
    bucket_size: f64,
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
            pipeline.unwrap(),
        );

        vec.push(output_batch.to_owned());
    }

    vec
}

pub fn rel_freq_in_bucket_of_operators_pipelines_of(
    batch: &RecordBatch,
    column_for_operator: usize,
    column_for_time: usize,
    bucket_size: f64,
    pipeline: Vec<&str>,
) -> RecordBatch {

    let batch = &sort_batch(batch, 2);

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
        while time_bucket < time.unwrap() {
            for operator in vec_operator {
                if bucket_map.get("sum").unwrap() > &0.0 {
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

        if pipeline.contains(&current_pipeline) {
            bucket_map.insert(
                current_operator,
                bucket_map.get(current_operator).unwrap() + 1.0,
            );
        }
        bucket_map.insert("sum", bucket_map.get("sum").unwrap() + 1.0);
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

pub fn rel_freq_in_bucket_of_operators_with_pipeline(
    batch: &RecordBatch,
    column_for_operator: usize,
    column_for_time: usize,
    with_pipelines: Vec<&str>,
    bucket_size: f64,
) -> RecordBatch {

    let output_batch = rel_freq_in_bucket_of_operators_pipelines_of(
        &batch,
        column_for_operator,
        column_for_time,
        bucket_size,
        with_pipelines,
    );

    output_batch

}

pub fn rel_freq_in_bucket_of_operators(
    batch: &RecordBatch,
    column_for_operator: usize,
    column_for_time: usize,
    bucket_size: f64,
) -> RecordBatch {

    let batch = &sort_batch(batch, 2);

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

    // init map
    for operator in vec_operator {
        bucket_map.insert(operator.unwrap(), 0.0);
    }
    bucket_map.insert("sum", 0.0);

    for time in time_column {

        while time_bucket < time.unwrap() {
            for operator in vec_operator {
                if bucket_map.get("sum").unwrap() > &0.0 {
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

            //while time_bucket < time.unwrap() {
                time_bucket += bucket_size;
            //}
        }
        let current_operator = operator_column.value(column_index as usize);
        bucket_map.insert("sum", bucket_map.get("sum").unwrap() + 1.0);
        let new_value = bucket_map.get(current_operator).unwrap() + 1.0;
        bucket_map.insert(
            current_operator,
            new_value,
        );
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

