use std::{collections::{HashMap, HashSet}, sync::Arc};

use arrow::{array::{Int64Array, StringArray}, datatypes::DataType, record_batch::RecordBatch};

use crate::{state::state::get_serde_dict, utils::{print_to_cons::print_to_js_with_obj, record_batch_util::create_new_record_batch}};

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

    let mut mapping_vec = Vec::new();
    // ev_name, uir, count (+ global sum)
    let mut hashmap_count = HashMap::new();
    let mut unqiue_events = HashSet::new();
    for entry in column.into_iter().enumerate() {
        let e = entry.1.unwrap();
        let hashmap = dict.dict.get("srclines").unwrap();
        let mapping = hashmap.get(&(e as u64)).unwrap();
        let current_ev = column_ev_name.value(entry.0);
        if mapping.contains("dump") || mapping.contains("proxy") {
            let split = mapping.split_terminator(":").collect::<Vec<&str>>();
            mapping_vec.push(split[1]);

            unqiue_events.insert(current_ev);
            let inner_hashmap = hashmap_count.entry(current_ev).or_insert(HashMap::new());
            inner_hashmap.entry(split[1]).or_insert(0);
            inner_hashmap.entry("sum").or_insert(0);
            inner_hashmap.insert(split[1], inner_hashmap[split[1]] + 1);
            inner_hashmap.insert("sum", inner_hashmap["sum"] + 1);

        }
    }

    let mut output_vec = Vec::new();


    let keys = dict.uri_dict.keys();
    let mut vec = keys.collect::<Vec<&String>>();
    let mut vec = vec.into_iter().map(|i| i.parse::<i64>().unwrap()).collect::<Vec<i64>>();
    vec.sort();
    print_to_js_with_obj(&format!("vec {:?}", vec).into());


    for entry in vec {
        let entry = entry.to_string();
        let mut vec = Vec::new();
        for event in &unqiue_events {
            let inner_hashmap = hashmap_count.get(event).unwrap();
          /*   print_to_js_with_obj(&format!("summe {:?}", inner_hashmap.get(entry)).into());
            print_to_js_with_obj(&format!("summe {:?}", inner_hashmap.get("sum")).into()); */
            let specific = *inner_hashmap.get(&(entry.as_str())).unwrap_or(&0) as f64;
            let total = *inner_hashmap.get("sum").unwrap() as f64;
            let percentage = specific / total;
            let percentage = f64::trunc((percentage) * 100.0) / 100.0;
            let out = format!("{}% ", percentage.to_string());
 
            vec.push(out);
        }

        let d = dict.uri_dict.get(&entry).unwrap();
        let mut output = format!("{}: {} | \n ", entry, &d.uir.as_ref().unwrap());
        for e in vec {
            output.push_str(&e);
        }
        output_vec.push(output);
    }

    let out_batch = create_new_record_batch(vec!["scrline"], vec![DataType::Utf8], vec![Arc::new(StringArray::from(output_vec))]);

    // dump* und proxy

    return out_batch;

}