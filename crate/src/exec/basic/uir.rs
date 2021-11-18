use std::{
    collections::{HashMap, HashSet},
    sync::Arc,
};

use arrow::{
    array::{Float64Array, Int64Array, StringArray},
    datatypes::DataType,
    record_batch::RecordBatch,
};

use crate::{
    state::state::get_serde_dict,
    utils::{print_to_cons::print_to_js_with_obj, record_batch_util::create_new_record_batch},
};

pub fn round(to_round: f64) -> f64 {
    f64::trunc((to_round) * 1000.0) / 10.0
}

pub fn uir(file_length: u64, record_batch: RecordBatch) -> RecordBatch {
    let column_ev_name = record_batch
        .column(1)
        .as_any()
        .downcast_ref::<StringArray>()
        .unwrap();

    let column = record_batch
        .column(5)
        .as_any()
        .downcast_ref::<Int64Array>()
        .unwrap();

    let dict = get_serde_dict().unwrap();

    // CALCULATE
    let mut srcline_key_vec = Vec::new();
    let mut hashmap_count = HashMap::new();
    let mut unique_events_set = HashSet::new();
    for entry in column.into_iter().enumerate() {
        let entry_num = entry.1.unwrap();
        let hashmap_samplekey_srcline = dict.dict.get("srclines").unwrap();
        let srcline = hashmap_samplekey_srcline.get(&(entry_num as u64)).unwrap();
        let current_ev = column_ev_name.value(entry.0);
        if srcline.contains("dump") || srcline.contains("proxy") {
            let split = srcline.split_terminator(":").collect::<Vec<&str>>();
            let srcline_key = split[1];
            let inner_hashmap = hashmap_count.entry(current_ev).or_insert(HashMap::new());
            srcline_key_vec.push(srcline_key);
            unique_events_set.insert(current_ev);
            inner_hashmap.entry(srcline_key).or_insert(0);
            inner_hashmap.insert(srcline_key, inner_hashmap[split[1]] + 1);
            inner_hashmap.entry("sum").or_insert(0);
            inner_hashmap.insert("sum", inner_hashmap["sum"] + 1);
        }
    }

    let mut output_vec = Vec::new();
    let mut buffer_percentage = Vec::new();
    let keys = dict.uri_dict.keys();
    let vec = keys.collect::<Vec<&String>>();
    let mut uirs = vec
        .into_iter()
        .map(|i| i.parse::<i64>().unwrap())
        .collect::<Vec<i64>>();
    uirs.sort();
    let mut unique_events_set = unique_events_set.into_iter().collect::<Vec<&str>>();
    unique_events_set.sort();

    // Get srcline, Percentage, op, pipe for every srcline
    for uir in uirs {
        let entry = uir.to_string();

        for event in &unique_events_set {
            let inner_hashmap = hashmap_count.get(event).unwrap();
            let specific = *inner_hashmap.get(&(entry.as_str())).unwrap_or(&0) as f64;
            let total = *inner_hashmap.get("sum").unwrap() as f64;
            let percentage = specific / total;
            let percentage = round(percentage);
            buffer_percentage.push(percentage)
        }

        let dict = dict.uri_dict.get(&entry).unwrap();
        let op = dict.op.as_ref();
        let pipe = dict.pipeline.as_ref();
        let srcline = dict.uir.as_ref();

        output_vec.push((
            srcline,
            buffer_percentage[0],
            buffer_percentage[1],
            buffer_percentage[2],
            buffer_percentage[3],
            op,
            pipe,
        ));
    }

    // Special treatment for functions with define, declare and aggregated output
    let mut aggregated_output_vec = Vec::new();
    for item in output_vec.clone().into_iter().enumerate() {
        let iter = item.0;
        let current_srcline = item.1;
        let current_srcline = current_srcline.0.unwrap();
        if current_srcline.contains("define") || current_srcline.contains("declare") {
            let mut buffer_percentage = Vec::new();
            for item in output_vec.clone().into_iter().enumerate() {
                if item.0 > iter {
                    let str = item.1;
                    let str = str.0;
                    if str.unwrap().contains("define") || str.unwrap().contains("declare") {
                        let mut sum1 = 0.;
                        for item in buffer_percentage.iter().step_by(4) {
                            sum1 += item;
                        }
                        let mut sum2 = 0.;
                        for item in buffer_percentage.iter().skip(1).step_by(4) {
                            sum2 += item;
                        }
                        let mut sum3 = 0.;
                        for item in buffer_percentage.iter().skip(2).step_by(4) {
                            sum3 += item;
                        }
                        let mut sum4 = 0.;
                        for item in buffer_percentage.iter().skip(3).step_by(4) {
                            sum4 += item;
                        }

                        let dict = dict.uri_dict.get(&item.0.to_string()).unwrap();
                        let op = dict.op.as_ref();
                        let pipe = dict.pipeline.as_ref();
                        aggregated_output_vec.push((str, sum1, sum2, sum3, sum4, op, pipe));

                        break;
                    } else {
                        for event in &unique_events_set {
                            let inner_hashmap = hashmap_count.get(event).unwrap();
                            let specific = *inner_hashmap
                                .get(&(item.0 as i64).to_string().as_str())
                                .unwrap_or(&0) as f64;
                            let total = *inner_hashmap.get("sum").unwrap() as f64;
                            let percentage = specific / total;
                            let percentage = f64::trunc((percentage) * 1000.0) / 1000.0;
                            buffer_percentage.push(percentage)
                        }
                    }
                }
            }
        } else {
            let item = item.1;
            aggregated_output_vec.push((item.0, item.1, item.2, item.3, item.4, item.5, item.6));
        }
    }


    let mut srcline = Vec::new();
    let mut perc_1 = Vec::new();
    let mut perc_2 = Vec::new();
    let mut perc_3 = Vec::new();
    let mut perc_4 = Vec::new();
    let mut op = Vec::new();
    let mut pipe = Vec::new();

    for input in aggregated_output_vec {
        srcline.push(format!("{}\n",input.0.unwrap()));
        perc_1.push(input.1);
        perc_2.push(input.2);
        perc_3.push(input.3);
        perc_4.push(input.4);
        if let Some(operator) = input.5 {
            op.push(operator.as_str());
        } else {
            op.push("None");
        }
        if let Some(pipeline) = input.6 {
            pipe.push(pipeline.as_str());
        } else {
            pipe.push("None");
        }
    }

    let out_batch = create_new_record_batch(
        vec!["scrline", "perc1", "perc2", "perc3", "perc4", "op", "pipe"],
        vec![
            DataType::Utf8,
            DataType::Float64,
            DataType::Float64,
            DataType::Float64,
            DataType::Float64,
            DataType::Utf8,
            DataType::Utf8,
        ],
        vec![
            Arc::new(StringArray::from(srcline)),
            Arc::new(Float64Array::from(perc_1)),
            Arc::new(Float64Array::from(perc_2)),
            Arc::new(Float64Array::from(perc_3)),
            Arc::new(Float64Array::from(perc_4)),
            Arc::new(StringArray::from(op)),
            Arc::new(StringArray::from(pipe)),
        ],
    );

    print_to_js_with_obj(&format!("{:?}", out_batch).into());

    return out_batch;
}
