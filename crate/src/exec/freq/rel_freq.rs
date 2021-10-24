use std::{collections::HashMap, sync::Arc};

use arrow::{
    record_batch::RecordBatch,
};

use crate::{
    exec::basic::{
        analyze::{sort_batch}
        },
    get_record_batches,
};

use super::freq;

pub fn rel_freq_with_pipelines(
    batch: &RecordBatch,
    column_for_operator: usize,
    column_for_time: usize,
    bucket_size: f64,
    pipelines: Vec<&str>,
    operators: Vec<&str>,
    from: f64,
    to: f64,
) -> RecordBatch {

    freq::freq_of_pipelines(batch, freq::Freq::REL, column_for_operator, column_for_time, bucket_size, pipelines, operators, from, to)

}

