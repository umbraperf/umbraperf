use std::usize;

use arrow::record_batch::RecordBatch;

use crate::{
    exec::freq::rel_freq,
    get_query_from_cache, insert_query_to_cache,
    record_batch_util::send_record_batch_to_js,
    utils::{print_to_cons::print_to_js_with_obj, record_batch_util::convert},
};

use super::{basic::{analyze, count}, freq::abs_freq::{self, abs_freq_of_event}};

fn split_at_excl_mark(params: &str) -> Vec<&str> {
    return params.split_terminator("!").collect::<Vec<&str>>();
}

fn split_at_colon(params: &str) -> Vec<&str> {
    return params.split_terminator(":").collect::<Vec<&str>>();
}

fn split_at_comma(params: &str) -> Vec<&str> {
    return params.split_terminator(",").collect::<Vec<&str>>();
}

fn split_at_and(params: &str) -> Vec<&str> {
    return params.split_terminator("&").collect::<Vec<&str>>();
}

fn split_at_double_and(params: &str) -> Vec<&str> {
    return params.split_terminator("&&").collect::<Vec<&str>>();
}

fn split_at_double_percent(params: &str) -> Vec<&str> {
    return params.split_terminator("%%").collect::<Vec<&str>>();
}

// Find name in Record Batch
// Panic if error, else usize of column
fn find_name(name: &str, batch: &RecordBatch) -> usize {
    print_to_js_with_obj(&format!("{:?}", name).into());

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
fn eval_filter(record_batch: RecordBatch, mut filter_vec: Vec<&str>) -> RecordBatch {
    if filter_vec.len() == 0 {
        return record_batch;
    } else {
        let split = filter_vec[0].split_terminator("=").collect::<Vec<&str>>();
        let column_str = split[0].replace("?", "");
        let filter_str = split[1].replace("\"", "");

        if filter_str.contains(&"to") {
            let filter_strs = filter_str.split_terminator("to").collect::<Vec<&str>>();
            let from = filter_strs[0].parse::<f64>().unwrap();
            let to = filter_strs[1].parse::<f64>().unwrap();

            filter_vec.remove(0);

            return eval_filter(
                analyze::filter_between(
                    find_name(column_str.as_str(), &record_batch),
                    from,
                    to,
                    &record_batch,
                ),
                filter_vec,
            );
        } else {
            let filter_strs = filter_str.split_terminator(",").collect::<Vec<&str>>();
            filter_vec.remove(0);
            return eval_filter(
                analyze::filter_with(
                    find_name(column_str.as_str(), &record_batch),
                    filter_strs,
                    &record_batch,
                ),
                filter_vec,
            );
        }
    }
}

fn abs_freq(record_batch: RecordBatch, params: &str) -> RecordBatch {
    let split_fields_bucket_size = split_at_colon(params);
    let fields = split_fields_bucket_size[0];

    if params.contains("&") {
        return abs_freq_double_event_pipeline(record_batch, params);
    } else {
        if !fields.contains("pipeline") {
            let bucket_size = split_fields_bucket_size[1].parse::<f64>().unwrap();

            return abs_freq::abs_freq_of_event(
                &record_batch,
                find_name("ev_name", &record_batch),
                find_name("time", &record_batch),
                bucket_size,
            );
        } else {
            let split = split_at_excl_mark(params);
            let split_fields_bucket_size = split_at_colon(split[0]);

            let bucket_size = split_fields_bucket_size[1].parse::<f64>().unwrap();

            let pipeline_vec = split_at_comma(split[1]);
            let operator_vec = split_at_comma(split[2]);

            return abs_freq::abs_freq_of_pipelines(
                &record_batch,
                find_name("operator", &record_batch),
                find_name("time", &record_batch),
                bucket_size,
                pipeline_vec,
                operator_vec,
            );
        }
    }
}

fn rel_freq_double_event_pipeline(record_batch: RecordBatch, params: &str) -> RecordBatch {
    let split = split_at_excl_mark(params);

    let before_excl_mark = 0;
    let after_excl_mark = 1;
    let split_fields_bucket_size = split_at_colon(split[before_excl_mark]);
    let end = split_at_and(split[after_excl_mark]);
    let pipeline_vec = split_at_comma(end[0]);
    let event_vec = split_at_comma(end[1]);

    let before_colon = 0;
    let after_colon = 1;
    let field_vec = split_at_comma(split_fields_bucket_size[before_colon]);

    let _pipeline = field_vec[before_colon];
    let time = field_vec[after_colon];
    let bucket_size = split_fields_bucket_size[after_colon]
        .parse::<f64>()
        .unwrap();

    return rel_freq::rel_freq_with_pipelines_with_double_events(
        &record_batch,
        find_name("operator", &record_batch),
        find_name(time, &record_batch),
        bucket_size,
        pipeline_vec,
        event_vec,
    );
}

fn abs_freq_double_event_pipeline(record_batch: RecordBatch, params: &str) -> RecordBatch {
    let split = split_at_excl_mark(params);

    let before_excl_mark = 0;
    let after_excl_mark = 1;
    let split_fields_bucket_size = split_at_colon(split[before_excl_mark]);
    let end = split_at_and(split[after_excl_mark]);
    let pipeline_vec = split_at_comma(end[0]);
    let event_vec = split_at_comma(end[1]);

    let before_colon = 0;
    let after_colon = 1;
    let field_vec = split_at_comma(split_fields_bucket_size[before_colon]);

    let _pipeline = field_vec[before_colon];
    let time = field_vec[after_colon];
    let bucket_size = split_fields_bucket_size[after_colon]
        .parse::<f64>()
        .unwrap();

    return abs_freq::abs_freq_with_pipelines_with_double_events(
        &record_batch,
        find_name("operator", &record_batch),
        find_name(time, &record_batch),
        bucket_size,
        pipeline_vec,
        event_vec,
    );
}

fn rel_freq_specific_pipelines(record_batch: RecordBatch, params: &str) -> RecordBatch {
    let split = split_at_excl_mark(params);

    let before_excl_mark = 0;
    let after_excl_mark = 1;
    let split_fields_bucket_size = split_at_colon(split[before_excl_mark]);
    let pipeline_vec = split_at_comma(split[after_excl_mark]);
    let operator_vec = split_at_comma(split[2]);

    let before_colon = 0;
    let after_colon = 1;
    let field_vec = split_fields_bucket_size[before_colon]
        .split_terminator(",")
        .collect::<Vec<&str>>();
    let bucket_size = split_fields_bucket_size[after_colon]
        .parse::<f64>()
        .unwrap();
    let _pipeline = field_vec[0];
    let time = field_vec[1];

    return rel_freq::rel_freq_with_pipelines(
        &record_batch,
        find_name("operator", &record_batch),
        find_name(time, &record_batch),
        bucket_size,
        pipeline_vec,
        operator_vec,
    );
}

fn rel_freq_multiple_pipelines(
    record_batch: RecordBatch,
    fields: &str,
    params: &str,
) -> RecordBatch {
    let field_vec = fields.split_terminator(",").collect::<Vec<&str>>();

    let time = field_vec[1];
    let _split = split_at_excl_mark(params);

    let split_fields_bucket_size = split_at_colon(params);
    let bucket_size = split_fields_bucket_size[1].parse::<f64>().unwrap();

    let vec_record_batches = rel_freq::rel_freq_for_each_pipelines(
        &record_batch,
        find_name("operator", &record_batch),
        find_name(time, &record_batch),
        find_name("pipeline", &record_batch),
        bucket_size,
    );

    let mut last_item_id = 0;
    for (i, item) in vec_record_batches.iter().enumerate() {
        if i + 1 == vec_record_batches.len() {
            last_item_id = i;
        } else {
            send_record_batch_to_js(item);
        }
    }
    let batch = &vec_record_batches[last_item_id];
    return batch.to_owned();
}

fn rel_freq_total_pipelines(record_batch: RecordBatch, fields: &str, params: &str) -> RecordBatch {
    let split_fields_bucket_size = split_at_colon(params);
    let bucket_size = split_fields_bucket_size[1].parse::<f64>().unwrap();

    return rel_freq::rel_freq_with_pipelines(
        &record_batch,
        find_name("operator", &record_batch),
        find_name(fields, &record_batch),
        bucket_size,
        Vec::new(),
        Vec::new(),
    );
}

fn rel_freq(record_batch: RecordBatch, params: &str) -> RecordBatch {
    let split_fields_bucket_size = split_at_colon(params);
    let fields = split_fields_bucket_size[0];

    if params.contains("!") {
        if params.contains("&") {
            return rel_freq_double_event_pipeline(record_batch, params);
        } else {
            return rel_freq_specific_pipelines(record_batch, params);
        }
    } else if fields.contains(",") {
        let split_fields_bucket_size = split_at_colon(params);
        let fields = split_fields_bucket_size[0];
        return rel_freq_multiple_pipelines(record_batch, fields, params);
    } else {
        let split_fields_bucket_size = split_at_colon(params);
        let time = split_fields_bucket_size[0];
        return rel_freq_total_pipelines(record_batch, time, params);
    }
}

fn add_column(record_batch: &RecordBatch, params: &str) -> RecordBatch {
    let split = split_at_comma(params);
    if split[0].contains("\"") {
        analyze::add_column(record_batch, &split[0].replace("\"", ""), split[1])
    } else {
        analyze::add_column_float(record_batch, split[0].parse::<f64>().unwrap(), split[1])
    }
}

fn rename(record_batch: &RecordBatch, params: &str) -> RecordBatch {
    let split = split_at_comma(params);
    analyze::rename(record_batch, split[0], split[1])
}

fn sort(record_batch: &RecordBatch, params: &str) -> RecordBatch {
    if params.contains(",") {
        let split = split_at_comma(params);
        if split[1] == "desc" {
            return analyze::sort_batch(&record_batch, find_name(split[0], &record_batch), true);
        } else {
            return analyze::sort_batch(&record_batch, find_name(split[0], &record_batch), false);
        }
    }
    return analyze::sort_batch(&record_batch, find_name(params, &record_batch), false);
}

fn eval_operations(mut record_batch: RecordBatch, op_vec: Vec<&str>) -> RecordBatch {
    for op in op_vec {
        let split = op.split_terminator("?").collect::<Vec<&str>>();
        let operator = split[0];
        let params = split[1];

        match operator {
            "rename" => {
                record_batch = rename(&record_batch, params);
            }
            "add_column" => {
                record_batch = add_column(&record_batch, params);
            }
            "distinct" => {
                record_batch =
                    analyze::find_unique_string(&record_batch, find_name(params, &record_batch));
            }
            "max(time)" => {
                print_to_js_with_obj(&format!("{:?}", "This").into());
                record_batch =
                    count::max_execution_time(&record_batch, find_name("time", &record_batch));
            }
            "relative" => {
                record_batch = count::relative(
                    &record_batch,
                    find_name("operator", &record_batch),
                    find_name("operator", &record_batch),
                );
            }
            "count(distinct)" => {
                record_batch =
                    count::count_total_unique(&record_batch, find_name(params, &record_batch));
            }
            "basic_count" => {
                record_batch = count::count(&record_batch, find_name(params, &record_batch));
            }
            "count" => {
                record_batch =
                    count::count_rows_over(&record_batch, find_name(params, &record_batch))
            }
            "absfreq" => {
                record_batch = abs_freq(record_batch, params);
            }
            "relfreq" => {
                record_batch = rel_freq(record_batch, params);
            }
            "sort" => {
                record_batch = sort(&record_batch, params);
            }
            _ => {
                panic!("Not supported operator!");
            }
        }
    }

    return record_batch;
}

fn eval_selections(record_batch: RecordBatch, select_vec: Vec<&str>) -> RecordBatch {
    let mut selections = Vec::new();

    for select in select_vec {
        selections.push(find_name(select, &record_batch));
    }

    return analyze::select_columns(record_batch, selections);
}

fn query_already_calculated(restful_string: &str) -> bool {
    if let Some(batch) = get_query_from_cache().get(restful_string) {
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

fn multiple_queries_union(restful_string: &str) -> bool {
    restful_string.contains("%%")
}

fn exec_query(record_batch: RecordBatch, restful_string: &str) -> RecordBatch {
    let split_query = split_query(restful_string);
    let record_batch = eval_filter(record_batch, split_query.0);
    let record_batch = eval_operations(record_batch, split_query.1);
    let record_batch = eval_selections(record_batch, split_query.2);
    record_batch
}

fn finish_query_exec(record_batch: RecordBatch, restful_string: &str) {
    if true {
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
            vec_batch.push(exec_query(record_batch.to_owned(), query));
        }
        finish_query_exec(analyze::concat_record_batches(vec_batch), restful_string);
    } else if multiple_queries_union(restful_string) {
        let split = split_at_double_percent(restful_string);
        let mut vec_batch = Vec::new();
        for query in split {
            vec_batch.push(exec_query(record_batch.to_owned(), query));
        }
        finish_query_exec(convert(vec_batch), restful_string);
    } else {
        let batch = exec_query(record_batch, restful_string);
        finish_query_exec(batch, restful_string);
    }
}
