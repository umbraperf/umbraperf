use std::{collections::HashMap, sync::Arc};

use arrow::{
    array::{
        Array, Float64Array, GenericStringArray, Int32Array, PrimitiveArray, StringArray,
        UInt64Array,
    },
    datatypes::{DataType, Float64Type, Int32Type, UInt64Type},
    record_batch::RecordBatch,
};

use crate::{exec::{basic::{basic::{find_unique_string, sort_batch}, filter::{filter_between_int32}, statistics}, rest::rest_api::finish_query_exec}, state::state::get_record_batches, utils::{
        record_batch_util::{
            create_new_record_batch, send_record_batch_to_js,
        },
    }};

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

    let freq_name;
    if matches!(freq, Freq::REL) {
        freq_name = "relfreq";
    } else {
        freq_name = "absfreq";
    }

    create_new_record_batch(
        vec!["bucket", column_for_operator_name, freq_name],
        vec![DataType::Float64, DataType::Utf8, DataType::Float64],
        vec![
            Arc::new(builder_bucket),
            Arc::new(operator_arr),
            Arc::new(builder_result),
        ],
    )
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

    let schema = record_batch.schema();
    let column_for_operator_name = schema.field(column_for_operator).name();

    create_new_record_batch(
        vec!["bucket", column_for_operator_name, "mem", "freq"],
        vec![
            DataType::Float64,
            DataType::Utf8,
            DataType::Int32,
            DataType::Float64,
        ],
        vec![
            Arc::new(builder_bucket),
            Arc::new(operator_arr),
            Arc::new(memory_arr),
            Arc::new(builder_result),
        ],
    )
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

pub fn get_uint_column(batch: &RecordBatch, column: usize) -> &PrimitiveArray<UInt64Type> {
    let column = batch
        .column(column)
        .as_any()
        .downcast_ref::<UInt64Array>()
        .unwrap();
    return column;
}

pub fn get_int32_column(batch: &RecordBatch, column: usize) -> &PrimitiveArray<Int32Type> {
    let column = batch
        .column(column)
        .as_any()
        .downcast_ref::<Int32Array>()
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

    let unique_operator =
        find_unique_string(&get_record_batches().unwrap().batch, column_for_operator);

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

pub enum MEM {
    DIFF,
    ABS
}

pub fn freq_of_memory(
    batch: &RecordBatch,
    column_for_operator: usize,
    column_for_time: usize,
    bucket_size: f64,
    from: f64,
    to: f64,
    len_of_mem: Option<i64>,
    mem_en: MEM
) {

   /*  let mem_column = get_uint_column(&batch, 4);
    let mem_vec = mem_column.into_iter().map(|v| (v.unwrap() as i64)).collect::<Vec<i64>>();

    let mean = statistics::mean(&mem_vec).unwrap();
    let std_deviation = statistics::std_deviation(&mem_vec).unwrap();
    let three_times = std_deviation * std_deviation * std_deviation;

    let from_ = mean - std_deviation;
    let to_ = mean + std_deviation;

    print_to_js_with_obj(&format!("std_deviation {:?}", std_deviation).into());
    print_to_js_with_obj(&format!("from {:?}", from).into());
    print_to_js_with_obj(&format!("to {:?}", to).into());

    let batch = filter_between_int32(4, from_ as f64, to_ as f64, &batch);

    print_to_js_with_obj(&format!("batch {:?}", batch).into()); */

    let batch = &sort_batch(&batch, 2, false);

    let unique_operator =
        find_unique_string(batch, column_for_operator);

    let unique_operator = &sort_batch(&unique_operator, 0, false);

    let vec_operator = get_stringarray_column(&unique_operator, 0);

    let mut result_bucket = Vec::new();
    let mut result_vec_operator = Vec::new();
    let mut result_mem_operator: Vec<i32> = Vec::new();
    let mut result_builder = Vec::new();

    let operator_column = get_stringarray_column(batch, column_for_operator);
    let time_column = get_floatarray_column(batch, column_for_time);
    let memory_column = get_uint_column(batch, 4);

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
        bucket_map.insert(operator.unwrap(), HashMap::<i32, f64>::new());
    }

    let mut bucket_map_count = HashMap::new();
    for operator in vec_operator {
        bucket_map_count.insert(operator.unwrap(), 0.);
    }

    let divided = if len_of_mem.is_some() {
        let mut out = 1;
        for _i in 0..len_of_mem.unwrap() {
            out *= 10;
        }
        out
    } else {
        10000000000
    };

    for (i, time) in time_column.into_iter().enumerate() {
        let current_operator = operator_column.value(column_index as usize);
        let current_memory = if matches!(mem_en, MEM::ABS) { (memory_column.value(column_index as usize) / divided) as i32 } else {
            if i == 0 {
                0 as i32
            } else {
                let current = memory_column.value(column_index as usize);
                let before = memory_column.value(column_index - 1 as usize);
                let diff = before as i64 - current as i64 ;
                diff as i32
            }
        };
        while time_bucket < time.unwrap() {

            for operator in vec_operator {
                let operator = operator.unwrap();

                let frequenzy = bucket_map.get(operator).unwrap();
                for item in frequenzy {
                    let times = *item.1 as i32;
                    for _i in 0..times {
                        result_bucket.push(f64::trunc((time_bucket) * 100.0) / 100.0);
                        result_vec_operator.push(operator);
                        result_mem_operator.push(current_memory);
                        result_builder.push(item.1.to_owned());
                        let current_value = bucket_map_count[operator] + 1.;
                        bucket_map_count.insert(operator, current_value);
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
                        let times = *item.1 as i32;
                        for _i in 0..times {
                            result_bucket.push(f64::trunc((time_bucket) * 100.0) / 100.0);
                            result_vec_operator.push(operator);
                            result_mem_operator.push(current_memory);
                            result_builder.push(item.1.to_owned());
                            let current_value = bucket_map_count[operator] + 1.;
                            bucket_map_count.insert(operator, current_value);
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

    let batch = create_mem_bucket(
        &batch,
        column_for_operator,
        result_bucket,
        result_vec_operator,
        result_mem_operator,
        result_builder,
    );


    let max_mem = arrow::compute::max(get_int32_column(&batch, 2)).unwrap();
    let min_mem = arrow::compute::min(get_int32_column(&batch, 2)).unwrap();
    let max_time = arrow::compute::max(get_floatarray_column(&batch, 0)).unwrap();
    let min_time = arrow::compute::min(get_floatarray_column(&batch, 0)).unwrap();
    let max_freq = arrow::compute::max(get_floatarray_column(&batch, 3)).unwrap();
    let min_freq = arrow::compute::min(get_floatarray_column(&batch, 3)).unwrap();
    let num_op = vec_operator.len() as f64;

    let meta_info = create_new_record_batch(
        vec![
            "max_mem", "min_mem", "max_time", "min_time", "max_freq", "min_freq", "num_op",
        ],
        vec![
            DataType::Int32,
            DataType::Int32,
            DataType::Float64,
            DataType::Float64,
            DataType::Float64,
            DataType::Float64,
            DataType::Float64,
        ],
        vec![
            Arc::new(Int32Array::from(vec![max_mem])),
            Arc::new(Int32Array::from(vec![min_mem])),
            Arc::new(Float64Array::from(vec![max_time])),
            Arc::new(Float64Array::from(vec![min_time])),
            Arc::new(Float64Array::from(vec![max_freq])),
            Arc::new(Float64Array::from(vec![min_freq])),
            Arc::new(Float64Array::from(vec![num_op])),
        ],
    );

    send_record_batch_to_js(&meta_info);

    let sorted_batch = sort_batch(&batch, 1, false);
    let mut offset = 0.;
    let mut hashmap = HashMap::new();

    for entry in vec_operator.into_iter().enumerate() {
        let len = bucket_map_count.get(entry.1.unwrap()).unwrap().to_owned();

        let batch = sorted_batch.slice(offset as usize, len as usize);

        let bucket = get_floatarray_column(&batch, 0);
        let mut bucket_vec = Vec::new();
        for entry in bucket {
            bucket_vec.push(entry.unwrap());
        }
        let operator = get_stringarray_column(&batch, 1);
        let mut operator_vec = Vec::new();
        for entry in operator {
            operator_vec.push(entry.unwrap());
        }
        let mem = get_int32_column(&batch, 2);
        let mut mem_vec = Vec::new();
        for entry in mem {
            mem_vec.push(entry.unwrap());
        }
        let freq = get_floatarray_column(&batch, 3);
        let mut freq_vec = Vec::new();
        for entry in freq {
            freq_vec.push(entry.unwrap());
        }

        let single_batch = create_new_record_batch(
            vec!["bucket", "operator", "mem", "freq"],
            vec![
                DataType::Float64,
                DataType::Utf8,
                DataType::Int32,
                DataType::Float64,
            ],
            vec![
                Arc::new(Float64Array::from(bucket_vec)),
                Arc::new(StringArray::from(operator_vec)),
                Arc::new(Int32Array::from(mem_vec)),
                Arc::new(Float64Array::from(freq_vec)),
            ],
               
        );

        let mem_column = get_int32_column(&single_batch, 2);
        let mem_vec = mem_column.into_iter().map(|v| (v.unwrap() as i64)).collect::<Vec<i64>>();
  
        let mean = statistics::mean(&mem_vec).unwrap();
        let std_deviation = statistics::std_deviation(&mem_vec).unwrap();
        //let three_times = std_deviation * std_deviation * std_deviation;

        let from = mean - std_deviation;
        let to = mean + std_deviation;

        let single_batch = filter_between_int32(2, from as i32, to as i32, &single_batch);

        let min_bucket = arrow::compute::min(bucket).unwrap();
        hashmap.insert((entry.1.unwrap(), min_bucket as usize),single_batch);

        offset += len;
    }

    let mut vec = Vec::new();
    for k in hashmap.keys() {
        vec.push(k);
    }

    vec.sort_by(|a, b| a.0.cmp(&b.0));
    vec.sort_by(|a, b| a.1.cmp(&b.1));

    for entry in vec {
        let batch = hashmap.get(entry).unwrap();
        send_record_batch_to_js(batch);
    }

}
