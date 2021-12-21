use super::freq;
use arrow::record_batch::RecordBatch;

pub fn rel_freq_operators(
    batch: &RecordBatch,
    column_for_operator: usize,
    column_for_time: usize,
    bucket_size: f64,
    pipelines: Vec<&str>,
    operators: Vec<&str>,
    from: f64,
    to: f64,
) -> RecordBatch {
    freq::freq_of_operators(
        batch,
        freq::Freq::REL,
        column_for_operator,
        column_for_time,
        bucket_size,
        pipelines,
        operators,
        from,
        to,
    )
}
