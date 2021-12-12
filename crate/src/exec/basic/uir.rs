use std::{
    collections::{HashMap, HashSet},
    sync::Arc,
};

use arrow::{
    array::{Float64Array, Int32Array, Int64Array, StringArray},
    datatypes::DataType,
    record_batch::RecordBatch,
};

use crate::{
    exec::basic::{basic::sort_batch, filter::filter_between_int32},
    state::state::{get_serde_dict, get_uir_record_batches, set_uir_record_batches},
    utils::record_batch_util::{self, create_new_record_batch},
};

use super::{basic::find_unique_string, filter::filter_with};

#[derive(Clone)]
pub struct ABSFREQ {
    abs_freq_1: f64,
    abs_freq_2: f64,
    abs_freq_3: f64,
    abs_freq_4: f64,
}

#[derive(Clone)]
pub struct RELFREQ {
    rel_freq_1: f64,
    rel_freq_2: f64,
    rel_freq_3: f64,
    rel_freq_4: f64,
}

pub fn round(to_round: f64) -> f64 {
    f64::trunc((to_round) * 1000.0) / 10.0
}

pub fn sum_of_vec(vec: Vec<f64>) -> (f64, f64, f64, f64) {
    let mut sum1 = 0.;
    for item in vec.iter().step_by(4) {
        sum1 += item;
    }
    let mut sum2 = 0.;
    for item in vec.iter().skip(1).step_by(4) {
        sum2 += item;
    }
    let mut sum3 = 0.;
    for item in vec.iter().skip(2).step_by(4) {
        sum3 += item;
    }
    let mut sum4 = 0.;
    for item in vec.iter().skip(3).step_by(4) {
        sum4 += item;
    }
    (sum1, sum2, sum3, sum4)
}

pub fn uir(_file_length: u64, record_batch: RecordBatch) -> RecordBatch {
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
        let current_ev = column_ev_name.value(entry.0);
        if mapping_to_dict_file.contains("dump") || mapping_to_dict_file.contains("proxy") {
            let split = mapping_to_dict_file
                .split_terminator(":")
                .collect::<Vec<&str>>();
            let srcline_key = split[1];
            if dict.uri_dict.get(srcline_key).is_some() {
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
                abs_freq_1: buffer_percentage[0],
                abs_freq_2: buffer_percentage[1],
                abs_freq_3: buffer_percentage[2],
                abs_freq_4: buffer_percentage[3],
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
                        let (sum1, sum2, sum3, sum4) = sum_of_vec(buffer_percentage);
                        let dict = dict.uri_dict.get(&item.0.to_string()).unwrap();
                        aggregated_output_vec.push((
                            Some(current_srcline.to_owned()),
                            ABSFREQ {
                                abs_freq_1: round(sum1),
                                abs_freq_2: round(sum2),
                                abs_freq_3: round(sum3),
                                abs_freq_4: round(sum4),
                            },
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
                            let percentage = specific / total;
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

    let (mut total_1, mut total_2, mut total_3, mut total_4) = (0., 0., 0., 0.);
    for item in aggregated_output_vec {
        if item.0.clone().unwrap().contains("define") {
            total_1 = item.1.abs_freq_1;
            total_2 = item.1.abs_freq_2;
            total_3 = item.1.abs_freq_3;
            total_4 = item.1.abs_freq_1;
            let rel_freq = RELFREQ {
                rel_freq_1: 0.,
                rel_freq_2: 0.,
                rel_freq_3: 0.,
                rel_freq_4: 0.,
            };
            aggregated_output_vec_2.push((item.0, item.1, item.2, item.3, item.4, rel_freq));
        } else {
            let rel_freq = RELFREQ {
                rel_freq_1: if total_1 == 0. {
                    0.
                } else {
                    round(item.1.abs_freq_1 / total_1)
                },
                rel_freq_2: if total_2 == 0. {
                    0.
                } else {
                    round(item.1.abs_freq_2 / total_2)
                },
                rel_freq_3: if total_3 == 0. {
                    0.
                } else {
                    round(item.1.abs_freq_3 / total_3)
                },
                rel_freq_4: if total_4 == 0. {
                    0.
                } else {
                    round(item.1.abs_freq_4 / total_4)
                },
            };
            aggregated_output_vec_2.push((item.0, item.1, item.2, item.3, item.4, rel_freq));
        }
    }

    let mut srcline = Vec::new();
    let (mut perc_1, mut perc_2, mut perc_3, mut perc_4) =
        (Vec::new(), Vec::new(), Vec::new(), Vec::new());
    let mut op = Vec::new();
    let mut pipe = Vec::new();
    let mut is_function_flag = Vec::new();
    let mut srcline_num = Vec::new();
    let (mut rel_perc_1, mut rel_perc_2, mut rel_perc_3, mut rel_perc_4) =
        (Vec::new(), Vec::new(), Vec::new(), Vec::new());

    for input in aggregated_output_vec_2.into_iter().enumerate() {
        let num = input.0;
        let input = input.1;
        srcline.push(format!("{}\n", input.0.unwrap()));
        perc_1.push(input.1.abs_freq_1);
        perc_2.push(input.1.abs_freq_2);
        perc_3.push(input.1.abs_freq_3);
        perc_4.push(input.1.abs_freq_4);
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
        rel_perc_1.push(input.5.rel_freq_1);
        rel_perc_2.push(input.5.rel_freq_2);
        rel_perc_3.push(input.5.rel_freq_3);
        rel_perc_4.push(input.5.rel_freq_4);
    }

    let out_batch = create_new_record_batch(
        vec![
            "scrline",
            "perc1",
            "perc2",
            "perc3",
            "perc4",
            "op",
            "pipe",
            "func_flag",
            "srcline_num",
            "rel_perc1",
            "rel_perc2",
            "rel_perc3",
            "rel_perc4",
        ],
        vec![
            DataType::Utf8,
            DataType::Float64,
            DataType::Float64,
            DataType::Float64,
            DataType::Float64,
            DataType::Utf8,
            DataType::Utf8,
            DataType::Int32,
            DataType::Int32,
            DataType::Float64,
            DataType::Float64,
            DataType::Float64,
            DataType::Float64,
        ],
        vec![
            Arc::new(StringArray::from(srcline)),
            Arc::new(Float64Array::from(perc_1)),
            Arc::new(Float64Array::from(perc_2)),
            Arc::new(Float64Array::from(perc_3)),
            Arc::new(Float64Array::from(perc_4)),
            Arc::new(StringArray::from(op)),
            Arc::new(StringArray::from(pipe)),
            Arc::new(Int32Array::from(is_function_flag)),
            Arc::new(Int32Array::from(srcline_num)),
            Arc::new(Float64Array::from(rel_perc_1)),
            Arc::new(Float64Array::from(rel_perc_2)),
            Arc::new(Float64Array::from(rel_perc_3)),
            Arc::new(Float64Array::from(rel_perc_4)),
        ],
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
    let batch = uir(0, record_batch);

    let only_functions = filter_between_int32(7, 0, 0, &batch);
    let sort = sort_batch(&only_functions, ordered_by + 1, true);

    let unique = find_unique_string(&sort, 5);
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
            let filter = filter_with(5, vec![&entry], &sort);
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

    let srcline = StringArray::from(batch.column(0).data().clone());
    let perc = Float64Array::from(batch.column(ordered_by + 1).data().clone());
    let op = StringArray::from(batch.column(5).data().clone());
    let srcline_num = Int32Array::from(batch.column(8).data().clone());
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
