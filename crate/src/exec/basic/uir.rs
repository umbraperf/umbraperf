use std::{
    collections::{HashMap, HashSet},
    sync::Arc,
};

use arrow::{
    array::{ArrayRef, Float64Array, Int32Array, Int64Array, StringArray},
    datatypes::DataType,
    record_batch::RecordBatch,
};

use crate::{
    exec::{
        basic::{basic::sort_batch, filter::filter_between_int32},
        rest::rest_api::find_name,
    },
    state::state::{get_serde_dict, get_uir_record_batches, set_uir_record_batches},
    utils::record_batch_util::{self, create_new_record_batch},
};

use super::{basic::find_unique_string, filter::filter_with};

#[derive(Clone, Debug)]
pub struct ABSFREQ {
    abs_freq: Vec<f64>,
}

#[derive(Clone, Debug)]
pub struct RELFREQ {
    rel_freq: Vec<f64>,
}

pub fn round(to_round: f64) -> f64 {
    f64::trunc((to_round) * 1000.0) / 10.0
}

pub fn sum_of_vec(vec: Vec<f64>, num_of_events: usize) -> Vec<f64> {
    let mut out_vec = Vec::new();
    for i in 0..num_of_events {
        let mut sum = 0.;
        for item in vec.iter().skip(i).step_by(num_of_events) {
            sum += item;
        }
        out_vec.push(f64::trunc((sum) * 100.0) / 100.0);
    }

    out_vec
}

pub fn uir(record_batch: RecordBatch) -> RecordBatch {
    let column_ev_name = record_batch
        .column(1)
        .as_any()
        .downcast_ref::<StringArray>()
        .unwrap();

    let column_srcline = record_batch
        .column(5)
        .as_any()
        .downcast_ref::<Int64Array>()
        .unwrap();

    let dict = get_serde_dict().unwrap();

    // CALCULATE
    let mut hashmap_count = HashMap::new();
    let mut unique_events_set = HashSet::new();

    for entry in column_srcline.into_iter().enumerate() {
        let entry_srcline_num = entry.1.unwrap();
        let hashmap_samplekey_srcline = dict.dict.get("srclines").unwrap();
        let mapping_to_dict_file = hashmap_samplekey_srcline
            .get(&(entry_srcline_num as u64))
            .unwrap();
        let mut current_ev = column_ev_name.value(entry.0);
        if mapping_to_dict_file.contains("dump") || mapping_to_dict_file.contains("proxy") {
            let split = mapping_to_dict_file
                .split_terminator(":")
                .collect::<Vec<&str>>();
            let srcline_key = split[1];
            if dict.uri_dict.get(srcline_key).is_some() {
                if entry.0 < 30 {
                    current_ev = "test_Event";
                }
                let inner_hashmap = hashmap_count.entry(current_ev).or_insert(HashMap::new());
                unique_events_set.insert(current_ev);

                inner_hashmap.entry(srcline_key).or_insert(0);
                inner_hashmap.insert(srcline_key, inner_hashmap[split[1]] + 1);
                inner_hashmap.entry("sum").or_insert(0);
                inner_hashmap.insert("sum", inner_hashmap["sum"] + 1);
            }
        }
    }

    let mut output_vec = Vec::new();
    let keys = dict.uri_dict.keys();
    let vec = keys.collect::<Vec<&String>>();
    let mut uirs = vec
        .into_iter()
        .map(|i| i.parse::<i64>().unwrap())
        .collect::<Vec<i64>>();
    uirs.sort();
    let mut unique_events_set = unique_events_set.into_iter().collect::<Vec<&str>>();
    unique_events_set.sort();

    for uir in uirs {
        let entry = uir.to_string();

        let mut buffer_percentage = Vec::new();

        for event in &unique_events_set {
            let inner_hashmap = hashmap_count.get(event).unwrap();
            let specific = *inner_hashmap.get(&(entry.as_str())).unwrap_or(&0) as f64;
            let total = *inner_hashmap.get("sum").unwrap() as f64;
            let percentage = specific / total;
            let percentage = round(percentage);
            buffer_percentage.push(percentage)
        }

        let dict = dict.uri_dict.get(&entry).unwrap();

        output_vec.push((
            dict.uir.as_ref(),
            ABSFREQ {
                abs_freq: buffer_percentage,
            },
            dict.op.as_ref(),
            dict.pipeline.as_ref(),
        ));
    }

    // Special treatment for functions with define, declare and aggregated output
    let mut aggregated_output_vec = Vec::new();
    for item in output_vec.clone().into_iter().enumerate() {
        let iter = item.0;
        let item = item.1;
        let current_srcline = item.0.unwrap();
        if current_srcline.contains("define") || current_srcline.contains("declare") {
            let mut buffer_percentage = Vec::new();
            for item in output_vec.clone().into_iter().enumerate() {
                if item.0 > iter {
                    let str = item.1;
                    let str = str.0;
                    if str.unwrap().contains("define") || str.unwrap().contains("declare") {
                        let sum_vec = sum_of_vec(buffer_percentage, unique_events_set.len());
                        let dict = dict.uri_dict.get(&item.0.to_string()).unwrap();
                        aggregated_output_vec.push((
                            Some(current_srcline.to_owned()),
                            ABSFREQ { abs_freq: sum_vec },
                            dict.op.as_ref(),
                            dict.pipeline.as_ref(),
                            1,
                        ));
                        break;
                    } else {
                        for event in &unique_events_set {
                            let inner_hashmap = hashmap_count.get(event).unwrap();
                            let specific = *inner_hashmap
                                .get(&(item.0 as i64).to_string().as_str())
                                .unwrap_or(&0) as f64;
                            let total = *inner_hashmap.get("sum").unwrap() as f64;
                            let percentage = round(specific / total);
                            buffer_percentage.push(percentage)
                        }
                    }
                }
            }
        } else {
            if item.0.unwrap().contains("const") || item.0.unwrap().starts_with("  ") {
                aggregated_output_vec.push((
                    Some(format!("{}", item.0.unwrap())),
                    item.1,
                    item.2,
                    item.3,
                    0,
                ));
            } else {
                aggregated_output_vec.push((
                    Some(format!("  {}", item.0.unwrap())),
                    item.1,
                    item.2,
                    item.3,
                    0,
                ));
            }
        }
    }

    let mut aggregated_output_vec_2 = Vec::new();

    let mut total_sum_vec = Vec::new();
    for _entry in &unique_events_set {
        total_sum_vec.push(0.);
    }
    for item in aggregated_output_vec {
        if item.0.clone().unwrap().contains("define") {
            total_sum_vec = Vec::new();
            for entry in item.1.abs_freq.clone() {
                total_sum_vec.push(entry);
            }
            let mut total_sum_vec_function = Vec::new();
            for _entry in &unique_events_set {
                total_sum_vec_function.push(0.);
            }
            let rel_freq = RELFREQ {
                rel_freq: total_sum_vec_function.clone(),
            };

            aggregated_output_vec_2.push((item.0, item.1, item.2, item.3, item.4, rel_freq));
        } else {
            let mut vec = Vec::new();
            for curr_freq in item.1.abs_freq.clone().into_iter().enumerate() {
                if total_sum_vec[curr_freq.0] == 0. {
                    vec.push(0.);
                } else {
                    vec.push(round(curr_freq.1 / total_sum_vec[curr_freq.0]));
                }
            }
            let rel_freq = RELFREQ {
                rel_freq: vec.clone(),
            };

            aggregated_output_vec_2.push((item.0, item.1, item.2, item.3, item.4, rel_freq));
        }
    }

    let mut srcline = Vec::new();
    let mut vec_vec_perc = Vec::new();
    let mut op = Vec::new();
    let mut pipe = Vec::new();
    let mut is_function_flag = Vec::new();
    let mut srcline_num = Vec::new();
    let mut vec_vec_rel_perc = Vec::new();

    for input in aggregated_output_vec_2.into_iter().enumerate() {
        let num = input.0;
        let input = input.1;
        srcline.push(format!("{}\n", input.0.unwrap()));
        vec_vec_perc.push(input.1);
        if let Some(operator) = input.2 {
            op.push(operator.as_str());
        } else {
            op.push("None");
        }
        if let Some(pipeline) = input.3 {
            pipe.push(pipeline.as_str());
        } else {
            pipe.push("None");
        }
        is_function_flag.push(input.4);
        srcline_num.push((num as i32) + 1);
        vec_vec_rel_perc.push(input.5);
    }

    let mut vec = Vec::new();
    for entry in unique_events_set.clone().into_iter().enumerate() {
        let value = entry.0 + 1;
        let mut str = "perc".to_owned();
        str.push_str(&value.to_string());
        vec.push(str);
    }
    let vec: Vec<&str> = vec.iter().map(AsRef::as_ref).collect();

    let mut vec_rel: Vec<String> = Vec::new();
    for entry in unique_events_set.clone().into_iter().enumerate() {
        let value = entry.0 + 1;
        let mut str = "rel_perc".to_owned();
        str.push_str(&value.to_string());
        vec_rel.push(str);
    }
    let vec_rel: Vec<&str> = vec_rel.iter().map(AsRef::as_ref).collect();

    let data = vec![
        vec!["scrline"],
        vec,
        vec!["op"],
        vec!["pipe"],
        vec!["func_flag"],
        vec!["srcline_num"],
        vec_rel,
    ];

    let mut vec_data = Vec::new();
    for _entry in &unique_events_set.clone() {
        vec_data.push(DataType::Float64);
    }
    let mut vec_rel_data = Vec::new();
    for _entry in &unique_events_set.clone() {
        vec_rel_data.push(DataType::Float64);
    }

    let data_datatype = vec![
        vec![DataType::Utf8],
        vec_data,
        vec![DataType::Utf8],
        vec![DataType::Utf8],
        vec![DataType::Int32],
        vec![DataType::Int32],
        vec_rel_data,
    ];

    let mut column_ref: Vec<ArrayRef> = Vec::new();

    column_ref.push(Arc::new(StringArray::from(srcline)));

    for entry in unique_events_set.clone().into_iter().enumerate() {
        let mut vec = Vec::new();
        for vec_perc in &vec_vec_perc {
            vec.push(vec_perc.abs_freq[entry.0]);
        }
        column_ref.push(Arc::new(Float64Array::from(vec)));
    }

    column_ref.push(Arc::new(StringArray::from(op)));
    column_ref.push(Arc::new(StringArray::from(pipe)));
    column_ref.push(Arc::new(Int32Array::from(is_function_flag)));
    column_ref.push(Arc::new(Int32Array::from(srcline_num)));

    for entry in unique_events_set.clone().into_iter().enumerate() {
        let mut vec = Vec::new();
        for vec_perc in &vec_vec_rel_perc {
            vec.push(vec_perc.rel_freq[entry.0]);
        }
        column_ref.push(Arc::new(Float64Array::from(vec)));
    }

    let out_batch = create_new_record_batch(
        data.into_iter().flatten().collect::<Vec<&str>>(),
        data_datatype
            .into_iter()
            .flatten()
            .collect::<Vec<DataType>>(),
        column_ref,
    );

    set_uir_record_batches(out_batch);

    let batch = get_uir_record_batches().unwrap().batch.clone();

    return batch;
}

pub fn get_max_top_five(record_batch: RecordBatch) -> RecordBatch {
    let num_rows = record_batch.num_rows();
    let max = 5.min(num_rows);
    return record_batch.slice(0, max);
}

pub fn get_top_srclines(record_batch: RecordBatch, ordered_by: usize) -> RecordBatch {
    let batch = uir(record_batch);

    let function_flac_col = find_name("func_flag", &batch);
    let only_functions = filter_between_int32(function_flac_col, 0, 0, &batch);
    let sort = sort_batch(&only_functions, ordered_by + 1, true);

    let op_col = find_name("op", &sort);
    let unique = find_unique_string(&sort, op_col);
    let unique = unique
        .column(0)
        .as_any()
        .downcast_ref::<StringArray>()
        .unwrap();

    let mut unique = unique
        .into_iter()
        .map(|e| e.unwrap().to_string())
        .collect::<Vec<String>>();
    unique.sort();

    let mut vec = Vec::new();
    vec.push(get_max_top_five(sort.clone()));
    let mut vec_sum = Vec::new();

    vec_sum.push(0.);
    vec_sum.push(0.);
    vec_sum.push(0.);
    vec_sum.push(0.);
    vec_sum.push(0.);
    for entry in unique {
        if entry.contains("None") {
        } else {
            let filter = filter_with(op_col, vec![&entry], &sort);
            let column = filter
                .column(ordered_by + 1)
                .as_any()
                .downcast_ref::<Float64Array>()
                .unwrap();
            let sum = f64::trunc((arrow::compute::sum(column).unwrap()) * 100.0) / 100.0;
            vec_sum.push(sum);
            vec_sum.push(sum);
            vec_sum.push(sum);
            vec_sum.push(sum);
            vec_sum.push(sum);
            vec.push(get_max_top_five(filter));
        }
    }

    let batch = record_batch_util::convert_without_mapping(vec);

    let srcline_num_col = find_name("srcline_num", &batch);

    let srcline = StringArray::from(batch.column(0).data().clone());
    let perc = Float64Array::from(batch.column(ordered_by + 1).data().clone());
    let op = StringArray::from(batch.column(op_col).data().clone());
    let srcline_num = Int32Array::from(batch.column(srcline_num_col).data().clone());
    let total = Float64Array::from(vec_sum);

    let mut op_vec = Vec::new();
    for entry in op.into_iter().enumerate() {
        if entry.0 < 5 {
            op_vec.push("root");
        } else {
            op_vec.push(entry.1.unwrap());
        }
    }

    let out_batch = create_new_record_batch(
        vec!["scrline", "perc", "op", "srcline_num", "total"],
        vec![
            DataType::Utf8,
            DataType::Float64,
            DataType::Utf8,
            DataType::Int32,
            DataType::Float64,
        ],
        vec![
            Arc::new(srcline),
            Arc::new(perc),
            Arc::new(StringArray::from(op_vec)),
            Arc::new(srcline_num),
            Arc::new(total),
        ],
    );

    out_batch
}
