use std::usize;

use arrow::record_batch::RecordBatch;

use crate::{exec::freq::rel_freq, record_batch_util::send_record_batch_to_js, utils::print_to_cons::print_to_js_with_obj};

use super::{basic::{analyze, count}, freq::abs_freq};


// Find name in Record Batch
// Panic if error else usize of column
fn find_name(name: &str, batch: &RecordBatch) -> usize {
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
// /?time=2                 -- for number // TODO
fn eval_filter(record_batch: RecordBatch, mut filter_vec: Vec<&str>) -> RecordBatch {
    if filter_vec.len() == 0 {
        return record_batch;
    } else {
        let split = filter_vec[0].split_terminator("=").collect::<Vec<&str>>();
        let column_str = split[0].replace("?", "");
        // "" needs to removed
        let filter_str = split[1].replace("\"", "");
        // Can be multiple by comma separated
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

// OPERATOR:
// count?operator
// -- distinct
// -- count
// -- relfreq
fn eval_operations(mut record_batch: RecordBatch, op_vec: Vec<&str>) -> RecordBatch {
    for op in op_vec {
        let split = op.split_terminator("?").collect::<Vec<&str>>();
        let operator = split[0];
        let params = split[1];

        match operator {
            // ev_name/distinct?ev_name
            "distinct" => {
                record_batch =
                    analyze::find_unique_string(&record_batch, find_name(params, &record_batch));
            }
            // operator/count/?ev_name="No Operator"/count?operator
            "count" => {
                record_batch =
                    count::count_rows_over(&record_batch, find_name(params, &record_batch))
            }
            // bucket/operator/absfreq/.../absfreq?time:0.2
            "absfreq" => {
                let split_fields_bucket_size = params.split_terminator(":").collect::<Vec<&str>>();
                let fields = split_fields_bucket_size[0];
                let bucket_size = split_fields_bucket_size[1].parse::<f64>().unwrap();
                record_batch = abs_freq::abs_freq_with_pipelines(&record_batch,
                    find_name("operator", &record_batch),
                    find_name(fields, &record_batch),
                    bucket_size);
            }
            "relfreq" => {
                let split_fields_bucket_size = params.split_terminator(":").collect::<Vec<&str>>();
                let fields = split_fields_bucket_size[0];
                // REQUEST FOR ONE! AREA CHART WITH SPECIFIC PIPELINES
                // range/operator/relfreq/?ev_name="No Operator"/relfreq?pipeline,time:0.2!join_join_tablescan_lineitem 129928658138264
                if params.contains("!") {
                    let split = params.split_terminator("!").collect::<Vec<&str>>();
                    let split_fields_bucket_size =
                        split[0].split_terminator(":").collect::<Vec<&str>>();

                    let field_vec = split_fields_bucket_size[0]
                        .split_terminator(",")
                        .collect::<Vec<&str>>();
                    let pipeline = field_vec[0];
                    let time = field_vec[1];
                    let bucket_size = split_fields_bucket_size[1].parse::<f64>().unwrap();

                    let pipeline_vec = split[1].split_terminator(",").collect::<Vec<&str>>();
                    print_to_js_with_obj(&format!("{:?}", pipeline_vec).into());

                    record_batch = rel_freq::rel_freq_with_pipelines(
                        &record_batch,
                        find_name("operator", &record_batch),
                        find_name(time, &record_batch),
                        bucket_size,
                        pipeline_vec,
                    );
                }
                // REQUEST FOR MULTIPLE PIPELINES
                // range/operator/relfreq/?ev_name="No Operator"/relfreq?pipeline,time:20
                else if fields.contains(",") {
                    let field_vec = fields.split_terminator(",").collect::<Vec<&str>>();

                    let pipeline = field_vec[0];
                    let time = field_vec[1];
                    let bucket_size = split_fields_bucket_size[1].parse::<f64>().unwrap();

                    let vec_record_batches = rel_freq::rel_freq_for_each_pipelines(
                        &record_batch,
                        find_name("operator", &record_batch),
                        find_name(time, &record_batch),
                        find_name("pipeline", &record_batch),
                        bucket_size,
                    );

                    for (i, item) in vec_record_batches.iter().enumerate() {
                        if i + 1 == vec_record_batches.len() {
                            record_batch = item.to_owned();
                        } else {
                            send_record_batch_to_js(item);
                        }
                    }
                // BASIC TOTAL REL_FREQUENCY REQUEST
                // range/operator/relfreq/?ev_name="No Operator"/relfreq?time:20
                } else {
                    let bucket_size = split_fields_bucket_size[1].parse::<f64>().unwrap();

                    record_batch = rel_freq::rel_freq_with_pipelines(
                        &record_batch,
                        find_name("operator", &record_batch),
                        find_name(fields, &record_batch),
                        bucket_size,
                        Vec::new(),
                    );
                }
            }
            // .../sort?<operator>
            "sort" => {
                record_batch = analyze::sort_batch(&record_batch, find_name(params, &record_batch));
            }
            _ => {
                panic!("Not supported operator!");
            }
        }
    }

    return record_batch;
}

// COLUMN:
// /operator
fn eval_selections(record_batch: RecordBatch, select_vec: Vec<&str>) -> RecordBatch {
    let mut selections = Vec::new();

    for select in select_vec {
        selections.push(find_name(select, &record_batch));
    }

    return analyze::get_columns(record_batch, selections);
}

// FILTER:
// /?operator=132
// OPERATOR:
// count?operator
// -- distinct
// -- count
// -- relFrequency
// COLUMN:
// /operator
pub fn eval_query(record_batch: RecordBatch, restful_string: &str) {
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

    let record_batch = eval_filter(record_batch, filter_vec);
    print_to_js_with_obj(&format!("{:?}", record_batch).into());
    let record_batch = eval_operations(record_batch, op_vec);
    print_to_js_with_obj(&format!("{:?}", record_batch).into());
    let record_batch = eval_selections(record_batch, select_vec);
    print_to_js_with_obj(&format!("{:?}", record_batch).into());
    send_record_batch_to_js(&record_batch);
}
