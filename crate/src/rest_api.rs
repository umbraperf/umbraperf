use arrow::record_batch::RecordBatch;

use crate::{analyze, print_to_js_with_obj, record_batch_util::send_record_batch_to_js};

// Find name in Record Batch
fn find_name(name: &str, batch: &RecordBatch) -> usize {
    let schema = batch.schema();
    let fields = schema.fields();

    for (i, field) in fields.iter().enumerate() {
        if field.name() == name {
            return i;
        }
    }
    return 99999;
}

// FILTER:
// /?operator="No operator" -- for String
// /?time=2                 -- for number
fn eval_filter(record_batch: RecordBatch, mut filter_vec: Vec<&str>) -> RecordBatch {
    if filter_vec.len() == 0 {
        return record_batch;
    } else {
        let split = filter_vec[0].split_terminator("=").collect::<Vec<&str>>();
        let column_str = split[0].replace("?", "");
        let filter_str = split[1].replace("\"", "");
        filter_vec.remove(0);
        return eval_filter(
            analyze::filter_with(
                find_name(column_str.as_str(), &record_batch),
                filter_str.as_str(),
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
fn eval_operations(record_batch: RecordBatch, op_vec: Vec<&str>) -> RecordBatch {
    for op in op_vec {
        let split = op.split_terminator("?").collect::<Vec<&str>>();
        let operator = split[0];
        let column = split[1];

        match operator {
            "distinct" => {
                return analyze::find_unique_string(
                    &record_batch,
                    find_name(column, &record_batch),
                );
            }
            "count" => {
                return analyze::count_rows_over(&record_batch, find_name(column, &record_batch))
            }
            "relfreq" => {
                let split = op.split_terminator(":").collect::<Vec<&str>>();
                let column = split[0];
                // Special case, when pipelines are requested
                if split[1].contains(",") {
                    let comma_split = column.split_terminator(",").collect::<Vec<&str>>();
                    let pipeline = comma_split[0];
                    let operator = comma_split[1];
                    let bucket_size = split[1].parse::<f64>().unwrap();

                    let vec_record_batches =
                        analyze::rel_freq_in_bucket_of_operators_with_pipelines(
                            &record_batch,
                            find_name(operator, &record_batch),
                            find_name("time", &record_batch),
                            find_name(pipeline, &record_batch),
                            bucket_size,
                        );
                        for (i, item) in vec_record_batches.iter().enumerate() {
                                if i + 1 == vec_record_batches.len() {
                                        return item.to_owned();
                                } else {
                                        send_record_batch_to_js(&record_batch); 
                                }
                            }
                        
                } else {
                    let bucket_size = split[1].parse::<f64>().unwrap();

                    return analyze::rel_freq_in_bucket_of_operators(
                        &record_batch,
                        find_name("operator", &record_batch),
                        find_name("time", &record_batch),
                        bucket_size,
                    );
                }
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

    print_to_js_with_obj(&format!("{:?}", selections).into());

    return analyze::get_columns(record_batch, selections);
}

// SAMPLE QUERIES
// ev_name/distinct?ev_name
// operator/count/?ev_name="No Operator"/count?operator
// range/operator/relfreq/?ev_name="No Operator"/relfreq?operator:20
// range/operator/relfreq/?ev_name="No Operator"/relfreq?pipeline,operator:20

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