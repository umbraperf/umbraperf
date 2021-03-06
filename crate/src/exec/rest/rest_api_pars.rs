use arrow::record_batch::RecordBatch;

use crate::{
    exec::{
        basic::basic,
        freq::{
            abs_freq,
            freq::{freq_of_memory, MEM},
            rel_freq,
        },
    },
    utils::string_util::{
        split_at_and, split_at_colon, split_at_comma, split_at_excl_mark, split_at_numop,
        split_at_to,
    },
};

use super::rest_api::find_name;

pub fn abs_freq_pars(record_batch: RecordBatch, params: &str) -> RecordBatch {
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
            let range = split_at_to(split[3]);

            return abs_freq::abs_freq_operators(
                &record_batch,
                find_name("operator", &record_batch),
                find_name("time", &record_batch),
                bucket_size,
                pipeline_vec,
                operator_vec,
                range[0].parse::<f64>().unwrap(),
                range[1].parse::<f64>().unwrap(),
            );
        }
    }
}

pub fn abs_freq_double_event_pipeline(record_batch: RecordBatch, params: &str) -> RecordBatch {
    let split = split_at_excl_mark(params);

    let before_excl_mark = 0;
    let after_excl_mark = 1;
    let split_fields_bucket_size = split_at_colon(split[before_excl_mark]);
    let end = split_at_and(split[after_excl_mark]);
    let pipeline_vec = split_at_comma(end[0]);
    let event_vec = split_at_comma(end[1]);
    let operator_vec = split_at_comma(end[2]);
    let range = split_at_to(end[3]);

    let before_colon = 0;
    let after_colon = 1;
    let field_vec = split_at_comma(split_fields_bucket_size[before_colon]);

    let _pipeline = field_vec[before_colon];
    let time = field_vec[after_colon];
    let bucket_size = split_fields_bucket_size[after_colon]
        .parse::<f64>()
        .unwrap();

    return abs_freq::abs_freq_operators_doub_event(
        &record_batch,
        find_name("operator", &record_batch),
        find_name(time, &record_batch),
        bucket_size,
        pipeline_vec,
        operator_vec,
        event_vec,
        range[0].parse::<f64>().unwrap(),
        range[1].parse::<f64>().unwrap(),
    );
}

pub fn rel_freq_specific_pipelines(record_batch: RecordBatch, params: &str) -> RecordBatch {
    let split = split_at_excl_mark(params);

    let before_excl_mark = 0;
    let after_excl_mark = 1;
    let split_fields_bucket_size = split_at_colon(split[before_excl_mark]);
    let pipeline_vec = split_at_comma(split[after_excl_mark]);
    let operator_vec = split_at_comma(split[2]);
    let range = split_at_to(split[3]);

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

    return rel_freq::rel_freq_operators(
        &record_batch,
        find_name("operator", &record_batch),
        find_name(time, &record_batch),
        bucket_size,
        pipeline_vec,
        operator_vec,
        range[0].parse::<f64>().unwrap(),
        range[1].parse::<f64>().unwrap(),
    );
}

pub fn rel_freq_pars(record_batch: RecordBatch, params: &str) -> RecordBatch {
    let split_fields_bucket_size = split_at_colon(params);
    let _fields = split_fields_bucket_size[0];

    return rel_freq_specific_pipelines(record_batch, params);
}

pub fn sort(record_batch: &RecordBatch, params: &str) -> RecordBatch {
    if params.contains(",") {
        let split = split_at_comma(params);
        if split[1] == "desc" {
            return basic::sort_batch(&record_batch, find_name(split[0], &record_batch), true);
        } else {
            return basic::sort_batch(&record_batch, find_name(split[0], &record_batch), false);
        }
    }
    return basic::sort_batch(&record_batch, find_name(params, &record_batch), false);
}

pub fn freq_mem(record_batch: RecordBatch, params: &str) {
    let split = split_at_excl_mark(params);
    let split_numop = split_at_numop(split[1]);

    let before_excl_mark = 0;
    let split_fields_bucket_size = split_at_colon(split[before_excl_mark]);
    let range_x_outlier = split_at_comma(split_numop[0]);
    let range_x = split_at_to(range_x_outlier[0]);
    let outlier = range_x_outlier[1];

    let abs_or_diff = if let Some(x) = split_numop.get(1) {
        match *x {
            "ABS" => MEM::ABS,
            "DIFF" => MEM::DIFF,
            _ => MEM::ABS,
        }
    } else {
        MEM::ABS
    };

    let _before_colon = 0;
    let after_colon = 1;
    let bucket_size = split_fields_bucket_size[after_colon]
        .parse::<f64>()
        .unwrap();

    freq_of_memory(
        &record_batch,
        find_name("operator", &record_batch),
        find_name("time", &record_batch),
        bucket_size,
        range_x[0].parse::<f64>().unwrap(),
        range_x[1].parse::<f64>().unwrap(),
        outlier.parse::<f64>().unwrap(),
        None,
        abs_or_diff,
    );
}
