use std::collections::HashMap;

use regex::Regex;

use crate::{
    state::state::{get_mapping_operator, get_record_batches, insert_mapping_hashmap},
    utils::{array_util::get_stringarray_column, record_batch_schema::RecordBatchSchema},
};

use super::{basic::find_unique_string, filter::filter_with};

pub fn join_hashmap() -> HashMap<&'static str, String> {
    let hashmap: HashMap<&str, String> = [
        ("inner", '\u{2a1d}'.to_string()),
        ("leftouter", '\u{27d5}'.to_string()),
        ("rightouter", '\u{27d6}'.to_string()),
        ("fullouter", '\u{27d7}'.to_string()),
        ("single", '\u{27d51}'.to_string()),
        //("leftmark", '\u{27d5M}'),
        //("rightmark", '\u{27d6M}'),
        ("leftsemi", '\u{22c9}'.to_string()),
        ("rightsemi", '\u{22ca}'.to_string()),
        ("leftanti", '\u{25b7}'.to_string()),
        ("rightanti", '\u{25c1}'.to_string()),
    ]
    .iter()
    .cloned()
    .collect();
    return hashmap;
}

pub fn operator_hashmap() -> HashMap<&'static str, String> {
    let hashmap: HashMap<&str, String> = [
        ("tablescan", '\u{2637}'.to_string()),
        ("groupbyscan", '\u{2637}'.to_string()),
        ("groupby", '\u{0393}'.to_string()),
        ("map", '\u{03c7}'.to_string()),
        ("sort", '\u{21de}'.to_string()),
        ("select", '\u{03c3}'.to_string()),
        ("groupjoin", '\u{2927}'.to_string()),
        ("temp", '\u{1F552}'.to_string()),
    ]
    .iter()
    .cloned()
    .collect();
    return hashmap;
}

fn remove_nums_fr_str(str: &str) -> String {
    let re = Regex::new("[0123456789]").unwrap();
    let cow_str = re.replace(str, "");
    let str_to = cow_str.to_string();
    return str_to;
}

fn get_nice_op_null(op_id: &str, clean_op_id: String) -> String {
    if op_id == "Kernel" || op_id == "No Operator" {
        return "-".to_string();
    } else {
        let mut str = operator_hashmap()
            .get(clean_op_id.as_str())
            .unwrap_or(&"".to_string())
            .to_owned();
        str.push_str(" ");
        str.push_str(clean_op_id.as_str());
        return str;
    }
}

fn get_nice_op(op_id: &str, clean_op_id: String, op_extens: String) -> String {
    let nice_op = if op_extens == "null" {
        get_nice_op_null(op_id, clean_op_id)
    } else {
        let out = if op_id.contains("tablescan") {
            let mut str = operator_hashmap().get("tablescan").unwrap().to_owned();
            str.push_str(" ");
            str.push_str(&op_extens);
            str.push_str(" ");
            str.push_str("scan");
            str
        } else if op_id.contains("join") {
            let str = op_extens.to_owned();
            let split = str.split_terminator("-").collect::<Vec<&str>>();
            let mut str = join_hashmap()
                .get(split[0])
                .unwrap_or(&"".to_string())
                .to_owned();
            str.push_str(" ");
            str.push_str(&op_extens);
            str.push_str(" ");
            str.push_str(&clean_op_id);
            str
        } else {
            let str = op_extens.to_owned();
            let split = str.split_terminator("-").collect::<Vec<&str>>();
            let mut str = operator_hashmap()
                .get(split[0])
                .unwrap_or(&"".to_string())
                .to_owned();
            str.push_str(&op_extens);
            str.push_str(" ");
            str.push_str(&clean_op_id);
            str
        };
        out
    };
    nice_op
}

pub fn init_mapping_operator() {
    let mapping = get_mapping_operator();
    let map = mapping.lock().unwrap();

    if map.len() > 0 {
        return;
    }

    let unique_batch = find_unique_string(
        &get_record_batches().unwrap().batch,
        RecordBatchSchema::Operator as usize,
    );

    let vec = get_stringarray_column(&unique_batch, 0);

    let mut hashmap = HashMap::new();

    for op_id in vec {
        let group_batch = filter_with(
            RecordBatchSchema::Operator as usize,
            vec![op_id.unwrap()],
            &get_record_batches().unwrap().batch,
        );

        let op_extens_col =
            get_stringarray_column(&group_batch, RecordBatchSchema::OpExtension as usize);
        let op_extens = op_extens_col.value(0).to_owned();
        let op_id = op_id.unwrap();
        let clean_op_id = remove_nums_fr_str(op_id);

        let nice_op = get_nice_op(op_id, clean_op_id, op_extens);

        hashmap.insert(op_id.to_string(), nice_op);
    }

    insert_mapping_hashmap(hashmap);
}
