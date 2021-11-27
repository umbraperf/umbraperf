use crate::{exec::basic::{basic, count, filter, kpis, uir::{get_top_srclines, uir}}, record_batch_util::send_record_batch_to_js, state::state::{get_file_size, get_query_from_cache, insert_query_to_cache}, utils::{print_to_cons::print_to_js_with_obj, record_batch_util::concat_record_batches, string_util::{split_at_comma, split_at_double_and, split_at_question_mark, split_at_to}}};
use arrow::record_batch::RecordBatch;
use std::usize;

use super::rest_api_pars::{abs_freq_pars,freq_mem, rel_freq_pars, sort};

// Find name in Record Batch
// Panic if error, else usize of column
pub fn find_name(name: &str, batch: &RecordBatch) -> usize {
    let schema = batch.schema();
    let fields = schema.fields();
    for (i, field) in fields.iter().enumerate() {
        if field.name() == name {
            return i;
        }
    }
    panic!("Name of column not found in record batch!");
}

// FILTER:
// /?operator="No operator" -- for String
fn eval_filters(record_batch: RecordBatch, mut filter_vec: Vec<&str>) -> RecordBatch {
    if filter_vec.len() == 0 {
        return record_batch;
    } else {
        let split = filter_vec[0].split_terminator("=").collect::<Vec<&str>>();
        let column_str = split[0].replace("?", "");
        let filter_str = split[1].replace("\"", "");

        if filter_str.contains(&"from_to") {
            let filter_strs = split_at_to(&filter_str);
            let from = filter_strs[0].parse::<f64>().unwrap();
            let to = filter_strs[1].parse::<f64>().unwrap();

            filter_vec.remove(0);

            return eval_filters(
                filter::filter_between(
                    find_name(column_str.as_str(), &record_batch),
                    from,
                    to,
                    &record_batch,
                ),
                filter_vec,
            );
        } else {
            let filter_strs = split_at_comma(&filter_str);
            filter_vec.remove(0);
            return eval_filters(
                filter::filter_with(
                    find_name(column_str.as_str(), &record_batch),
                    filter_strs,
                    &record_batch,
                ),
                filter_vec,
            );
        }
    }
}

fn eval_operations(mut record_batch: RecordBatch, op_vec: Vec<&str>) -> Option<RecordBatch> {
    for op in op_vec {
        let split = split_at_question_mark(op);
        let operator = split[0];
        let params = split[1];

        match operator {
            "sunburst" => {
                record_batch = count::count_rows_over_double(&record_batch, 3, 0);
            }
            "distinct" => {
                record_batch =
                    basic::find_unique_string(&record_batch, find_name(params, &record_batch));
            }
            "max(time)" => {
                record_batch =
                    kpis::max_execution_time(&record_batch, find_name("time", &record_batch));
            }
            "relative" => {
                record_batch = kpis::relative(
                    &record_batch,
                    find_name("operator", &record_batch),
                    find_name("operator", &record_batch),
                );
            }
            "count(distinct)" => {
                record_batch =
                    count::count_total_unique(&record_batch, &find_name(params, &record_batch));
            }
            "basic_count" => {
                record_batch = count::count(&record_batch, find_name(params, &record_batch));
            }
            "count" => {
                record_batch =
                    count::count_rows_over(&record_batch, find_name(params, &record_batch))
            }
            "absfreq" => {
                record_batch = abs_freq_pars(record_batch, params);
            }
            "relfreq" => {
                record_batch = rel_freq_pars(record_batch, params);
            }
            "sort" => {
                record_batch = sort(&record_batch, params);
            }
            "heatmap" => {
                freq_mem(record_batch, params);
                return None;
            }
            "uir" => {
                record_batch = uir(get_file_size().unwrap(), record_batch);
            }
            "top(srclines)" => {
                let order = params.parse::<i32>().unwrap();
                record_batch = get_top_srclines(order as usize);
            }
            _ => {
                panic!("Not supported operator!");
            }
        }
    }

    return Some(record_batch);
}

fn eval_selections(record_batch: RecordBatch, select_vec: Vec<&str>) -> RecordBatch {
    let mut selections = Vec::new();

    for select in select_vec {
        selections.push(find_name(select, &record_batch));
    }

    return basic::select_columns(record_batch, selections);
}

fn query_already_calculated(restful_string: &str) -> bool {
    let cache = get_query_from_cache();
    let query = cache.lock().unwrap();
    if let Some(batch) = query.get(restful_string) {
        send_record_batch_to_js(&batch);
        return true;
    }
    return false;
}

fn split_query(restful_string: &str) -> (Vec<&str>, Vec<&str>, Vec<&str>) {
    let split = restful_string.split_terminator("/");

    let mut filter_vec = Vec::new();
    let mut op_vec = Vec::new();
    let mut select_vec = Vec::new();

    for item in split {
        if item.starts_with("?") {
            filter_vec.push(item);
        } else if !item.starts_with("?") && item.contains("?") {
            op_vec.push(item);
        } else {
            select_vec.push(item);
        }
    }

    return (filter_vec, op_vec, select_vec);
}

fn multiple_queries_concat(restful_string: &str) -> bool {
    restful_string.contains("&&")
}

fn exec_query(record_batch: RecordBatch, restful_string: &str) -> Option<RecordBatch> {
    let split_query = split_query(restful_string);
    let record_batch = eval_filters(record_batch, split_query.0);
    let record_batch = eval_operations(record_batch, split_query.1);
    if let Some(batch) = record_batch {
        let record_batch = eval_selections(batch, split_query.2);
        return Some(record_batch);
    } else {
        return None;
    }
}

pub fn finish_query_exec(record_batch: RecordBatch, restful_string: &str) {
    if false {
        print_to_js_with_obj(&format!("{:?}", restful_string).into());
        print_to_js_with_obj(&format!("{:?}", record_batch).into());
    }
    send_record_batch_to_js(&record_batch);
    insert_query_to_cache(restful_string, record_batch);
}

pub fn eval_query(record_batch: RecordBatch, restful_string: &str) {
    print_to_js_with_obj(&format!("{:?}", restful_string).into());

    if query_already_calculated(restful_string) {
        return;
    }

    if multiple_queries_concat(restful_string) {
        let split = split_at_double_and(restful_string);
        let mut vec_batch = Vec::new();
        for query in split {
            vec_batch.push(exec_query(record_batch.to_owned(), query).unwrap());
        }
        finish_query_exec(concat_record_batches(vec_batch), restful_string);
    } else {
        let batch = exec_query(record_batch, restful_string);
        if let Some(batch) = batch {
            finish_query_exec(batch, restful_string);
        }
    }
}
