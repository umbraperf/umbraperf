use std::{
    collections::{HashMap, HashSet},
    sync::Arc,
};

use arrow::{
    array::{Int64Array, StringArray},
    datatypes::DataType,
    record_batch::RecordBatch,
};

use crate::{
    state::state::get_serde_dict,
    utils::{print_to_cons::print_to_js_with_obj, record_batch_util::create_new_record_batch},
};

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

    let keys = dict.uri_dict.keys();
    let vec = keys.collect::<Vec<&String>>();
    let mut vec = vec
        .into_iter()
        .map(|i| i.parse::<i64>().unwrap())
        .collect::<Vec<i64>>();
    vec.sort();

    let mut unique_events_set = unique_events_set.into_iter().collect::<Vec<&str>>();
    unique_events_set.sort();

    for entry in vec {
        let entry = entry.to_string();
        let mut buffer_percentage = Vec::new();
        for event in &unique_events_set {
            let inner_hashmap = hashmap_count.get(event).unwrap();
            let specific = *inner_hashmap.get(&(entry.as_str())).unwrap_or(&0) as f64;
            let total = *inner_hashmap.get("sum").unwrap() as f64;
            let percentage = specific / total;
            let percentage = f64::trunc((percentage) * 1000.0) / 1000.0;
            buffer_percentage.push(percentage)
        }

        let mut vec = Vec::new();

        let mut has_entries = false;
        for perc in &buffer_percentage {
            if perc > &0. {
                has_entries = true;
                break;
            }
        }

        if has_entries {
            vec.push("// ".to_string());
            for perc in buffer_percentage {
                let out = format!("{}% ", perc.to_string());
                vec.push(out);
            }
        }

        let d = dict.uri_dict.get(&entry).unwrap();
        let srcline = &d.uir.as_ref().unwrap();
        let len_srcline = srcline.chars().count();
        if len_srcline < 140 {
            let diff = 140 - len_srcline;
            let repeat = " ".repeat(diff);
            let mut output = format!("{} {}", &d.uir.as_ref().unwrap(), repeat);
            for e in vec {
                output.push_str(&e);
            }
            output.push_str(" \n");
            output_vec.push(output);
        } else {
            let mut output = format!("{}", &d.uir.as_ref().unwrap());
            for e in vec {
                output.push_str(&e);
            }
            output.push_str(" \n");
            output_vec.push(output);
        }
    }

    let out_batch = create_new_record_batch(
        vec!["scrline"],
        vec![DataType::Utf8],
        vec![Arc::new(StringArray::from(output_vec))],
    );

    return out_batch;
}
