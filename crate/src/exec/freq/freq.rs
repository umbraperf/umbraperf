use std::{collections::HashMap, sync::Arc};

use arrow::{
    array::{Array, Float64Array, Int32Array, StringArray},
    datatypes::DataType,
    record_batch::RecordBatch,
};

use crate::{
    exec::basic::{
        basic::{find_unique_string, sort_batch},
        filter::filter_between_int32,
        op_mapping::init_mapping_operator,
        statistics,
    },
    state::state::{
        get_mapping_operator, get_record_batches, get_swimlane_record_batch,
        reset_swimlane_record_batch, set_swimlane_record_batch,
    },
    utils::{
        array_util::{
            get_floatarray_column, get_int32_column, get_stringarray_column, get_uint_column,
        },
        record_batch_schema::RecordBatchSchema,
        record_batch_util::{create_new_record_batch, send_record_batch_to_js},
    },
};

pub enum Freq {
    ABS,
    REL,
}

pub fn round(to_round: f64) -> f64 {
    return f64::trunc((to_round) * 100.0) / 100.0;
}

// Creates a record batch for the abs/rel frequency of an operator
pub fn create_freq_bucket(
    record_batch: &RecordBatch,
    column_for_operator: usize,
    result_time_bucket: Vec<f64>,
    result_vec_operator: Vec<&str>,
    result_vec_operator_nice_format: Vec<&str>,
    result_freq: Vec<f64>,
    freq_type: Freq,
) -> RecordBatch {
    let time_bucket_arr = Float64Array::from(result_time_bucket);
    let nice_operator_arr = StringArray::from(result_vec_operator_nice_format);
    let operator_arr = StringArray::from(result_vec_operator);
    let freq_arr = Float64Array::from(result_freq);

    // Get the name of the operator dynamic from the record batch
    let schema = record_batch.schema();
    let operator_col_name = schema.field(column_for_operator).name();

    let freq_name;
    if matches!(freq_type, Freq::REL) {
        freq_name = "relfreq";
    } else {
        freq_name = "absfreq";
    }

    create_new_record_batch(
        vec!["bucket", "op_ext", operator_col_name, freq_name],
        vec![
            DataType::Float64,
            DataType::Utf8,
            DataType::Utf8,
            DataType::Float64,
        ],
        vec![
            Arc::new(time_bucket_arr),
            Arc::new(nice_operator_arr),
            Arc::new(operator_arr),
            Arc::new(freq_arr),
        ],
    )
}

// Creates a record batch for the memory addresses and their frequency
pub fn create_mem_bucket(
    record_batch: &RecordBatch,
    column_for_operator: usize,
    result_time_bucket: Vec<f64>,
    result_operator: Vec<&str>,
    result_memory: Vec<i32>,
    result_freq: Vec<f64>,
) -> RecordBatch {
    let time_bucket_arr = Float64Array::from(result_time_bucket);
    let operator_arr = StringArray::from(result_operator);
    let memory_arr = Int32Array::from(result_memory);
    let freq_arr = Float64Array::from(result_freq);

    // Get the name of the operator dynamic from the record batch
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
            Arc::new(time_bucket_arr),
            Arc::new(operator_arr),
            Arc::new(memory_arr),
            Arc::new(freq_arr),
        ],
    )
}

pub fn freq_of_operators(
    batch: &RecordBatch,
    freq_type: Freq,
    column_for_operator: usize,
    column_for_time: usize,
    bucket_size: f64,
    pipelines: Vec<&str>,
    operators: Vec<&str>,
    from: f64,
    _to: f64,
) -> RecordBatch {
    // The relative freq and absolute freq of operators are calculates quite the same,
    // therefore when the absolute is requested the data for the relative is cached
    if let Some(pre_calc_batch) = get_swimlane_record_batch() {
        let batch = pre_calc_batch.batch.to_owned();
        reset_swimlane_record_batch();
        return batch;
    }

    // Vector of unqiue operators
    let unique_op_batch =
        find_unique_string(&get_record_batches().unwrap().batch, column_for_operator);
    let unique_op = get_stringarray_column(&unique_op_batch, 0);

    // Init result vectors
    let mut result_time_bucket = Vec::new();
    let mut result_vec_operator = Vec::new();
    let mut result_vec_operator_nice_format = Vec::new();
    let mut result_abs_freq = Vec::new();
    let mut result_rel_freq = Vec::new();

    // Init columns needed for calculations
    let operator_column = get_stringarray_column(batch, column_for_operator);
    let time_column = get_floatarray_column(batch, column_for_time);
    let pipeline_column = get_stringarray_column(batch, RecordBatchSchema::Pipeline as usize);

    // Time bucket starts at zero or from the time given by the query
    let mut time_bucket = if from == -1. {
        0. + bucket_size
    } else {
        from + bucket_size
    };

    // Bucket map to init the amount of occurences in the batch
    let mut bucket_map = HashMap::new();
    for operator in unique_op {
        bucket_map.insert(operator.unwrap(), 0.0);
    }
    bucket_map.insert("sum", 0.0);

    // Mapping for the nice operator (OperatorID => Operator with "nice" name)
    init_mapping_operator();
    let mapping = get_mapping_operator();
    let map = mapping.lock().unwrap();

    for (i, time) in time_column.into_iter().enumerate() {
        let current_operator = operator_column.value(i);
        let current_pipeline = pipeline_column.value(i);
        let current_time = time.unwrap();

        // While time_bucket is smaller than current time
        // write sum of operators found before in result vectors
        while time_bucket < current_time {
            for operator in unique_op {

                let operator = operator.unwrap();
                let abs_freq = bucket_map.get(operator).unwrap();

                // Set data for one time bucket
                result_time_bucket.push(round(round(time_bucket) - bucket_size));
                result_vec_operator.push(operator);
                result_vec_operator_nice_format.push(map.get(operator).unwrap());
                result_abs_freq.push(abs_freq.to_owned());

                // For relative freq
                if bucket_map.get(operator).unwrap() == &0.0 {
                    let rel_freq = 0.0;
                    result_rel_freq.push(rel_freq);
                } else {
                    let rel_freq =
                        bucket_map.get(operator).unwrap() / bucket_map.get("sum").unwrap();
                    let rel_freq_rounded = f64::trunc(rel_freq * 100.0) / 100.0;
                    result_rel_freq.push(rel_freq_rounded);
                }

                // Reset
                bucket_map.insert(operator, 0.0);
            }
            // Reset for relative freq
            bucket_map.insert("sum", 0.0);
            // Increase bucket size
            time_bucket += bucket_size;
        }

        // If pipelines and operator are both requested include them in the calculations
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

        // For relative freq
        bucket_map.insert("sum", bucket_map.get("sum").unwrap() + 1.0);

        // Edge case: If you have the last entry 
        // you need to write down all data which
        // goes into that bucket
        if i == time_column.len() - 1 {
            for operator in unique_op {

                let operator = operator.unwrap();
                let frequenzy = bucket_map.get(operator).unwrap();

                // Set data for one time bucket
                result_time_bucket.push(round(round(time_bucket) - bucket_size));
                result_vec_operator.push(operator);
                result_vec_operator_nice_format.push(map.get(operator).unwrap());
                result_abs_freq.push(frequenzy.to_owned());

                // For relative freq
                if bucket_map.get(operator).unwrap() == &0.0 {
                    let frequenzy = 0.0;
                    result_rel_freq.push(frequenzy);
                } else {
                    let rel_freq =
                        bucket_map.get(operator).unwrap() / bucket_map.get("sum").unwrap();
                    let rel_freq_rounded = f64::trunc(rel_freq * 100.0) / 100.0;
                    result_rel_freq.push(rel_freq_rounded);
                }
            }
        }
    }

    let result_vec_operator_nice_format: Vec<&str> = result_vec_operator_nice_format
        .iter()
        .map(AsRef::as_ref)
        .collect();

    // The relative freq and absolute freq of operators are calculates quite the same,
    // therefore when the absolute is requested the data for the relative is cached
    if matches!(freq_type, Freq::REL) {
        let pre_calc_batch = create_freq_bucket(
            &batch,
            column_for_operator,
            result_time_bucket.to_owned(),
            result_vec_operator.to_owned(),
            result_vec_operator_nice_format.to_owned(),
            result_abs_freq.to_owned(),
            Freq::ABS,
        );
        set_swimlane_record_batch(pre_calc_batch);
    }

    return create_freq_bucket(
        &batch,
        column_for_operator,
        result_time_bucket,
        result_vec_operator,
        result_vec_operator_nice_format,
        if matches!(freq_type, Freq::ABS) {
            result_abs_freq
        } else {
            result_rel_freq
        },
        freq_type,
    );
}

pub enum MEM {
    DIFF,
    ABS,
}

pub fn freq_of_memory(
    batch: &RecordBatch,
    column_for_operator: usize,
    column_for_time: usize,
    bucket_size: f64,
    from: f64,
    _to: f64,
    outlier: f64,
    len_of_mem: Option<i64>,
    mem_type: MEM,
) {
    // Vector of unqiue operators
    let unique_operator = find_unique_string(batch, column_for_operator);
    let unique_operator = &sort_batch(&unique_operator, 0, false);
    let op_arr = get_stringarray_column(&unique_operator, 0);

    let mut result_bucket = Vec::new();
    let mut result_vec_operator = Vec::new();
    let mut result_mem_operator: Vec<i32> = Vec::new();
    let mut result_builder = Vec::new();

    let operator_column = get_stringarray_column(batch, column_for_operator);
    let time_column = get_floatarray_column(batch, column_for_time);
    let memory_column = get_uint_column(batch, 4);

    // Time bucket starts at zero or from the time given by the query
    let mut time_bucket = if from == -1. {
        0. + bucket_size
    } else {
        from + bucket_size
    };
    time_bucket = f64::trunc(time_bucket);

    let mut bucket_map = HashMap::new();
    for operator in op_arr {
        bucket_map.insert(operator.unwrap(), HashMap::<i32, f64>::new());
    }

    let mut bucket_map_count = HashMap::new();
    for operator in op_arr {
        bucket_map_count.insert(operator.unwrap(), 0.);
    }

    let divided = if len_of_mem.is_some() {
        let mut out = 1;
        for _i in 0..len_of_mem.unwrap() {
            out *= 10;
        }
        out
    } else {
        100000000000
    };

    let mut hashmap_operator_before = HashMap::new();

    'outer: for (i, time) in time_column.into_iter().enumerate() {
        let current_operator = operator_column.value(i as usize);
        if i == 0 && matches!(mem_type, MEM::DIFF) {
            continue 'outer;
        }
        let value_earlier_index = hashmap_operator_before
            .get(current_operator)
            .unwrap_or(&usize::MAX)
            .to_owned();
        hashmap_operator_before.insert(current_operator, i);

        if (value_earlier_index as usize) == usize::MAX && matches!(mem_type, MEM::DIFF) {
            continue 'outer;
        }
        let current_memory = if matches!(mem_type, MEM::ABS) {
            let mem = (memory_column.value(i as usize) / divided) as i32;
            mem
        } else {
            let value1 = memory_column.value(i as usize);

            let value_earlier = memory_column.value(value_earlier_index as usize);

            let diff = value_earlier as i64 - value1 as i64;

            diff as i32
        };
        while time_bucket < time.unwrap() {
            for operator in op_arr {
                let operator = operator.unwrap();

                let frequenzy = bucket_map.get(operator).unwrap();
                for item in frequenzy {
                    let times = *item.1 as i32;
                    for _i in 0..times {
                        result_bucket.push(round(round(time_bucket) - bucket_size));
                        result_vec_operator.push(operator);
                        result_mem_operator.push(*item.0);
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
            for operator in op_arr {
                let operator = operator.unwrap();

                let frequenzy = bucket_map.get(operator).unwrap();
                for item in frequenzy {
                    let times = *item.1 as i32;
                    for _i in 0..times {
                        result_bucket.push(round(round(time_bucket) - bucket_size));
                        result_vec_operator.push(operator);
                        result_mem_operator.push(*item.0);
                        result_builder.push(item.1.to_owned());
                        let current_value = bucket_map_count[operator] + 1.;
                        bucket_map_count.insert(operator, current_value);
                    }
                }
                // Reset
                bucket_map.insert(operator, HashMap::new());
            }
        }
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
    let num_op = op_arr.len() as f64;

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

    for entry in op_arr.into_iter().enumerate() {
        let len = bucket_map_count.get(entry.1.unwrap()).unwrap().to_owned();

        if len == 0. {
            let single_batch = create_new_record_batch(
                vec!["bucket", "operator", "mem", "freq"],
                vec![
                    DataType::Float64,
                    DataType::Utf8,
                    DataType::Int32,
                    DataType::Float64,
                ],
                vec![
                    Arc::new(Float64Array::from(vec![-1.])),
                    Arc::new(StringArray::from(vec![entry.1.unwrap()])),
                    Arc::new(Int32Array::from(vec![0])),
                    Arc::new(Float64Array::from(vec![0.])),
                ],
            );
            hashmap.insert((entry.1.unwrap(), 0 as usize), single_batch);
            continue;
        }

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

        if matches!(mem_type, MEM::ABS) && outlier > 0. {
            let mem_column = get_int32_column(&single_batch, 2);
            let mem_vec = mem_column
                .into_iter()
                .map(|v| (v.unwrap() as i64))
                .collect::<Vec<i64>>();

            let mean = statistics::mean(&mem_vec).unwrap();
            let std_deviation = statistics::std_deviation(&mem_vec).unwrap();

            let from = mean - (std_deviation * 1. / outlier);

            let to = mean + (std_deviation * 1. / outlier);

            let single_batch = filter_between_int32(2, from as i32, to as i32, &single_batch);

            let min_bucket = arrow::compute::min(bucket).unwrap();
            hashmap.insert((entry.1.unwrap(), min_bucket as usize), single_batch);
        } else {
            let min_bucket = arrow::compute::min(bucket).unwrap();
            hashmap.insert((entry.1.unwrap(), min_bucket as usize), single_batch);
        }

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
