use std::{collections::HashMap, convert::TryInto, ops::Rem, sync::Arc};

use arrow::{
    array::{
        Float64Array, GenericStringArray, Int32Array, Int64Array, PrimitiveArray, StringArray,
    },
    datatypes::{DataType, Field, Float64Type, Int64Type, Schema},
    record_batch::RecordBatch,
};

use crate::{
    exec::basic::{
        basic::{find_unique_string, sort_batch},
        filter::filter_with,
    },
    get_record_batches,
    utils::print_to_cons::print_to_js_with_obj,
};

pub enum Freq {
    ABS,
    REL,
}

pub fn create_freq_bucket(
    record_batch: &RecordBatch,
    column_for_operator: usize,
    result_bucket: Vec<f64>,
    result_vec_operator: Vec<&str>,
    result_builder: Vec<f64>,
    freq: Freq,
) -> RecordBatch {
    let builder_bucket = Float64Array::from(result_bucket);
    let operator_arr = StringArray::from(result_vec_operator);
    let builder_result = Float64Array::from(result_builder);

    // Record Batch
    let schema = record_batch.schema();
    let column_for_operator_name = schema.field(column_for_operator).name();

    let field_bucket = Field::new("bucket", DataType::Float64, false);
    let field_operator = Field::new(column_for_operator_name, DataType::Utf8, false);
    let freq_name;
    if matches!(freq, Freq::REL) {
        freq_name = "relfreq";
    } else {
        freq_name = "absfreq";
    }
    let result_field = Field::new(freq_name, DataType::Float64, false);

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

pub fn create_mem_bucket(
    record_batch: &RecordBatch,
    column_for_operator: usize,
    result_bucket: Vec<f64>,
    result_vec_operator: Vec<&str>,
    result_vec_memory: Vec<i32>,
    result_builder: Vec<f64>,
) -> RecordBatch {
    let builder_bucket = Float64Array::from(result_bucket);
    let operator_arr = StringArray::from(result_vec_operator);
    let memory_arr = Int32Array::from(result_vec_memory);
    let builder_result = Float64Array::from(result_builder);

    // Record Batch
    let schema = record_batch.schema();
    let column_for_operator_name = schema.field(column_for_operator).name();

    let field_bucket = Field::new("bucket", DataType::Float64, false);
    let field_operator = Field::new(column_for_operator_name, DataType::Utf8, false);
    let mem_field = Field::new("mem", DataType::Int32, false);
    let result_field = Field::new("freq", DataType::Float64, false);

    let schema = Schema::new(vec![field_bucket, field_operator, mem_field, result_field]);

    RecordBatch::try_new(
        Arc::new(schema),
        vec![
            Arc::new(builder_bucket),
            Arc::new(operator_arr),
            Arc::new(memory_arr),
            Arc::new(builder_result),
        ],
    )
    .unwrap()
}

pub fn get_stringarray_column(batch: &RecordBatch, column: usize) -> &GenericStringArray<i32> {
    let column = batch
        .column(column)
        .as_any()
        .downcast_ref::<StringArray>()
        .unwrap();
    return column;
}

pub fn get_floatarray_column(batch: &RecordBatch, column: usize) -> &PrimitiveArray<Float64Type> {
    let column = batch
        .column(column)
        .as_any()
        .downcast_ref::<Float64Array>()
        .unwrap();
    return column;
}

pub fn get_int_column(batch: &RecordBatch, column: usize) -> &PrimitiveArray<Int64Type> {
    let column = batch
        .column(column)
        .as_any()
        .downcast_ref::<Int64Array>()
        .unwrap();
    return column;
}

pub fn freq_of_pipelines(
    batch: &RecordBatch,
    freq: Freq,
    column_for_operator: usize,
    column_for_time: usize,
    bucket_size: f64,
    pipelines: Vec<&str>,
    operators: Vec<&str>,
    from: f64,
    to: f64,
) -> RecordBatch {
    let batch = &sort_batch(batch, 2, false);

    let unique_operator = find_unique_string(&get_record_batches().unwrap(), column_for_operator);

    // Vector of unique strings
    let vec_operator = get_stringarray_column(&unique_operator, 0);

    let mut result_bucket = Vec::new();
    let mut result_vec_operator = Vec::new();
    let mut result_builder = Vec::new();

    let operator_column = get_stringarray_column(batch, column_for_operator);
    let time_column = get_floatarray_column(batch, column_for_time);
    let pipeline_column = get_stringarray_column(batch, 3);

    let mut time_bucket;
    if from == -1. {
        time_bucket = 0.;
    } else {
        time_bucket = from;
    }

    time_bucket = f64::trunc(time_bucket);
    let mut column_index = 0;

    let mut bucket_map = HashMap::new();
    for operator in vec_operator {
        bucket_map.insert(operator.unwrap(), 0.0);
    }

    if matches!(freq, Freq::REL) {
        bucket_map.insert("sum", 0.0);
    }

    for (i, time) in time_column.into_iter().enumerate() {
        let current_operator = operator_column.value(column_index as usize);
        let current_pipeline = pipeline_column.value(column_index as usize);
        while time_bucket < time.unwrap() {
            for operator in vec_operator {
                let operator = operator.unwrap();
                result_bucket.push(f64::trunc((time_bucket) * 100.0) / 100.0);
                result_vec_operator.push(operator);

                if matches!(freq, Freq::ABS) {
                    let frequenzy = bucket_map.get(operator).unwrap();
                    result_builder.push(frequenzy.to_owned());
                } else {
                    if bucket_map.get(operator).unwrap() == &0.0 {
                        let frequenzy = 0.0;
                        result_builder.push(frequenzy);
                    } else {
                        let frequenzy =
                            bucket_map.get(operator).unwrap() / bucket_map.get("sum").unwrap();
                        let frequenzy_rounded = f64::trunc(frequenzy * 100.0) / 100.0;
                        result_builder.push(frequenzy_rounded);
                    }
                }
                // reset bucket_map
                bucket_map.insert(operator, 0.0);
            }
            if matches!(freq, Freq::REL) {
                bucket_map.insert("sum", 0.0);
            }
            time_bucket += bucket_size;
        }

        if (pipelines.contains(&current_pipeline)
            || pipelines.len() == 0
            || (pipelines.len() == 1 && pipelines[0] == "All"))
            && ((operators.len() == 1 && operators[0] == "All")
                || operators.contains(&current_operator)
                || operators.len() == 0)
        {
            bucket_map.insert(
                current_operator,
                bucket_map.get(current_operator).unwrap() + 1.0,
            );
        }

        if matches!(freq, Freq::REL) {
            bucket_map.insert("sum", bucket_map.get("sum").unwrap() + 1.0);
        }

        if i == time_column.len() - 1 {
            while time_bucket < to {
                for operator in vec_operator {
                    let operator = operator.unwrap();
                    result_bucket.push(f64::trunc((time_bucket) * 100.0) / 100.0);
                    result_vec_operator.push(operator);
                    let bucket = bucket_map.to_owned();
                    if matches!(freq, Freq::ABS) {
                        let frequenzy = bucket.get(operator).unwrap();
                        result_builder.push(frequenzy.to_owned());
                    } else {
                        if bucket_map.get(operator).unwrap() == &0.0 {
                            let frequenzy = 0.0;
                            result_builder.push(frequenzy);
                        } else {
                            let frequenzy =
                                bucket_map.get(operator).unwrap() / bucket_map.get("sum").unwrap();
                            let frequenzy_rounded = f64::trunc(frequenzy * 100.0) / 100.0;
                            result_builder.push(frequenzy_rounded);
                        }
                    }
                    // reset bucket_map
                    bucket_map.insert(operator, 0.0);
                }
                time_bucket += bucket_size;
            }
        }

        column_index += 1;
    }

    return create_freq_bucket(
        &batch,
        column_for_operator,
        result_bucket,
        result_vec_operator,
        result_builder,
        freq,
    );
}

pub fn freq_of_memory(
    batch: &RecordBatch,
    column_for_operator: usize,
    column_for_time: usize,
    bucket_size: f64,
    from: f64,
    to: f64,
) -> RecordBatch {
    print_to_js_with_obj(&format!("{:?}", "In Memory").into());

    //let batch = &filter_with(0, vec!["groupby139628250252480"], batch);

    let batch = &sort_batch(batch, 2, false);

    let unique_operator = find_unique_string(&get_record_batches().unwrap(), column_for_operator);

    // Vector of unique strings
    let vec_operator = get_stringarray_column(&unique_operator, 0);

    let mut result_bucket = Vec::new();
    let mut result_vec_operator = Vec::new();
    let mut result_mem_operator: Vec<i32> = Vec::new();
    let mut result_builder = Vec::new();

    let operator_column = get_stringarray_column(batch, column_for_operator);
    let time_column = get_floatarray_column(batch, column_for_time);
    let memory_column = get_int_column(batch, 4);

    let mut time_bucket;
    if from == -1. {
        time_bucket = 0.;
    } else {
        time_bucket = from;
    }

    time_bucket = f64::trunc(time_bucket);
    let mut column_index = 0;

    let mut bucket_map = HashMap::new();
    for operator in vec_operator {
        bucket_map.insert(operator.unwrap(), HashMap::<i64, f64>::new());
    }

    for (i, time) in time_column.into_iter().enumerate() {
        let current_operator = operator_column.value(column_index as usize);
        let current_memory = memory_column.value(column_index as usize) / 100000000;
        while time_bucket < time.unwrap() {
            for operator in vec_operator {
                let operator = operator.unwrap();

                let frequenzy = bucket_map.get(operator).unwrap();
                for item in frequenzy {
                    let times = item.0.to_owned().try_into().unwrap();
                    for i in 0..times {
                        result_bucket.push(f64::trunc((time_bucket) * 100.0) / 100.0);
                        result_vec_operator.push(operator);
                        result_mem_operator.push(current_memory.try_into().unwrap());
                        result_builder.push(item.1.to_owned());
                    }
                }
                // reset bucket_map
                bucket_map.insert(operator, HashMap::new());
            }
            time_bucket += bucket_size;
        }

        let inner_hashmap = bucket_map.entry(current_operator).or_insert(HashMap::new());
        inner_hashmap.entry(current_memory).or_insert(0.);
        inner_hashmap.insert(current_memory, inner_hashmap[&current_memory] + 1.);

        if i == time_column.len() - 1 {
            while time_bucket < to {
                for operator in vec_operator {
                    let operator = operator.unwrap();

                    let frequenzy = bucket_map.get(operator).unwrap();
                    for item in frequenzy {
                        let times = item.0.to_owned().try_into().unwrap();
                        for i in 0..times {
                            result_bucket.push(f64::trunc((time_bucket) * 100.0) / 100.0);
                            result_vec_operator.push(operator);
                            result_mem_operator.push(current_memory.try_into().unwrap());
                            result_builder.push(item.1.to_owned());
                        }
                    }
                    // reset bucket_map
                    bucket_map.insert(operator, HashMap::new());
                }
                time_bucket += bucket_size;
            }
        }

        column_index += 1;
    }

    print_to_js_with_obj(&format!("{:?}", result_bucket).into());
    print_to_js_with_obj(&format!("{:?}", result_vec_operator).into());
    print_to_js_with_obj(&format!("{:?}", result_mem_operator).into());
    print_to_js_with_obj(&format!("{:?}", result_builder).into());

    let batch = create_mem_bucket(
        &batch,
        column_for_operator,
        result_bucket,
        result_vec_operator,
        result_mem_operator,
        result_builder,
    );

    print_to_js_with_obj(&format!("{:?}", batch).into());

    batch
}
