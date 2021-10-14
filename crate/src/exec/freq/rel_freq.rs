use std::{collections::HashMap, sync::Arc};

use arrow::{array::{Float64Array, StringArray}, datatypes::{DataType, Field, Schema}, record_batch::RecordBatch};

use crate::{exec::{basic::analyze::{self, find_unique_string, sort_batch}, freq::abs_freq::{abs_freq_of_event, abs_freq_of_pipelines}}, get_record_batches};


pub fn create_rel_freq_bucket(
    record_batch: &RecordBatch,
    column_for_operator: usize,
    result_bucket: Vec<f64>,
    result_vec_operator: Vec<&str>,
    result_builder: Vec<f64>,
) -> RecordBatch {
    let builder_bucket = Float64Array::from(result_bucket);
    let operator_arr = StringArray::from(result_vec_operator);
    let builder_result = Float64Array::from(result_builder);

    // Record Batch
    let schema = record_batch.schema();
    let column_for_operator_name = schema.field(column_for_operator).name();

    let field_bucket = Field::new("bucket", DataType::Float64, false);
    let field_operator = Field::new(column_for_operator_name, DataType::Utf8, false);
    let result_field = Field::new("relfreq", DataType::Float64, false);

    let schema = Schema::new(vec![field_bucket, field_operator, result_field]);

    RecordBatch::try_new(
        Arc::new(schema),
        vec![
            Arc::new(builder_bucket),
            Arc::new(operator_arr),
            Arc::new(builder_result),
        ],
    )
    .unwrap()
}

pub fn rel_freq_for_each_pipelines(
    batch: &RecordBatch,
    column_for_operator: usize,
    column_for_time: usize,
    column_for_pipeline: usize,
    bucket_size: f64,
) -> Vec<RecordBatch> {
    let mut vec = Vec::new();

    let unique_pipelines = find_unique_string(batch, column_for_pipeline);
    let unique_pipelines = sort_batch(&unique_pipelines, 0, false);

    let pipeline_vec = unique_pipelines
        .column(0)
        .as_any()
        .downcast_ref::<StringArray>()
        .unwrap();

    for pipeline in pipeline_vec {
        let mut vec_pipeline = Vec::new();
        vec_pipeline.push(pipeline.unwrap());
        let output_batch = rel_freq_with_pipelines(
            &batch,
            column_for_operator,
            column_for_time,
            bucket_size,
            vec_pipeline,
            Vec::new()
        );

        vec.push(output_batch.to_owned());
    }

    vec
}

pub fn rel_freq_with_pipelines(
    batch: &RecordBatch,
    column_for_operator: usize,
    column_for_time: usize,
    bucket_size: f64,
    pipelines: Vec<&str>,
    operators: Vec<&str>
) -> RecordBatch {
    let batch = &sort_batch(batch, 2, false);

    let unique_operator = find_unique_string(&get_record_batches().unwrap(), column_for_operator);

    // Vector of unique strings
    let vec_operator = unique_operator
        .column(0)
        .as_any()
        .downcast_ref::<StringArray>()
        .unwrap();

    let mut result_bucket = Vec::new();
    let mut result_vec_operator = Vec::new();
    let mut result_builder = Vec::new();

    let operator_column = batch
        .column(column_for_operator)
        .as_any()
        .downcast_ref::<StringArray>()
        .unwrap();
    let time_column = batch
        .column(column_for_time)
        .as_any()
        .downcast_ref::<Float64Array>()
        .unwrap();
    // TODO
    let pipeline_column = batch
        .column(3)
        .as_any()
        .downcast_ref::<StringArray>()
        .unwrap();

    let mut time_bucket = arrow::compute::min(time_column).unwrap();
    time_bucket = f64::trunc(time_bucket );
    let mut column_index = 0;
    

    let mut bucket_map = HashMap::new();
    for operator in vec_operator {
        bucket_map.insert(operator.unwrap(), 0.0);
    }

    bucket_map.insert("sum", 0.0);

    for (i, time) in time_column.into_iter().enumerate() {
        let current_operator = operator_column.value(column_index as usize);
        let current_pipeline = pipeline_column.value(column_index as usize);
        while time_bucket <= time.unwrap() {
            
            for operator in vec_operator {
                    let operator = operator.unwrap();
                    result_bucket.push((f64::trunc((time_bucket) * 100.0) / 100.0));
                    result_vec_operator.push(operator);
                    if bucket_map.get(operator).unwrap() == &0.0 {
                        let frequenzy = 0.0;
                    result_builder.push(frequenzy);
                    } else {
                        let frequenzy =
                        bucket_map.get(operator).unwrap() / bucket_map.get("sum").unwrap();
                    let frequenzy_rounded = f64::trunc(frequenzy * 100.0) / 100.0;
                    result_builder.push(frequenzy_rounded);
                    }
                    // reset bucket_map
                    bucket_map.insert(operator, 0.0);
            }

            // reset sum
            bucket_map.insert("sum", 0.0);
            time_bucket += bucket_size;
        }

        if (pipelines.contains(&current_pipeline) || pipelines.len() == 0 || (pipelines.len() == 1 && pipelines[0] == "All")) 
        && (operators.contains(&current_operator) || operators.len() == 0 || (operators.len() == 1 && operators[0] == "All")){
            bucket_map.insert(
                current_operator,
                bucket_map.get(current_operator).unwrap() + 1.0,
            );
        }
        bucket_map.insert("sum", bucket_map.get("sum").unwrap() + 1.0);

        if i == time_column.len() - 1 {

            for operator in vec_operator {
                let operator = operator.unwrap();
                result_bucket.push((f64::trunc((time_bucket) * 100.0) / 100.0) );
                result_vec_operator.push(operator);
                let frequenzy =
                    bucket_map.get(operator).unwrap() / bucket_map.get("sum").unwrap();
                let frequenzy_rounded = f64::trunc(frequenzy * 100.0) / 100.0;
                result_builder.push(frequenzy_rounded);
                
            }
        }

        column_index += 1;
    }

    create_rel_freq_bucket(
        &batch,
        column_for_operator,
        result_bucket,
        result_vec_operator,
        result_builder,
    )
}



pub fn rel_freq_with_pipelines_with_double_events (
    batch: &RecordBatch,
    column_for_operator: usize,
    column_for_time: usize,
    bucket_size: f64,
    pipelines: Vec<&str>,
    events: Vec<&str>) -> RecordBatch {

        let mut vec = Vec::new();
        vec.push(events[0]);
        let f_batch = analyze::filter_with(1, vec, batch);
        

        let mut vec1 = Vec::new();
        let mut vec2 = Vec::new();
        let mut vec3 = Vec::new();
        let mut vec4 = Vec::new();
        let mut vec5 = Vec::new();
        let mut vec6 = Vec::new();

        let first_filter_batch = rel_freq_with_pipelines(&f_batch, column_for_operator, column_for_time, bucket_size, pipelines.clone(), Vec::new());

        let column1 = first_filter_batch.column(0)
        .as_any()
        .downcast_ref::<Float64Array>()
        .unwrap();
        let column2 = first_filter_batch.column(1)
        .as_any()
        .downcast_ref::<StringArray>()
        .unwrap();
        let column3 = first_filter_batch.column(2)
        .as_any()
        .downcast_ref::<Float64Array>()
        .unwrap();

        let mut i = 0;
        while i < column1.len() {
            vec1.push(column1.value(i));
            vec2.push(column2.value(i));
            vec3.push(column3.value(i));
            vec4.push(0.0);
            vec5.push("");
            vec6.push(0.0);
            i = i + 1;
        }

        let mut vec = Vec::new();

        vec.push(events[1]);

        let batch = analyze::filter_with(1, vec, &batch);
        let second_filter_batch = rel_freq_with_pipelines(&batch, column_for_operator, column_for_time, bucket_size, pipelines, Vec::new());

        let column4 = second_filter_batch.column(0)
        .as_any()
        .downcast_ref::<Float64Array>()
        .unwrap();
        let column5 = second_filter_batch.column(1)
        .as_any()
        .downcast_ref::<StringArray>()
        .unwrap();
        let column6 = second_filter_batch.column(2)
        .as_any()
        .downcast_ref::<Float64Array>()
        .unwrap();

        let mut i = 0;
        while i < column4.len() {
            vec1.push(0.0);
            vec2.push("");
            vec3.push(0.0);
            vec4.push(column4.value(i));
            vec5.push(column5.value(i));
            vec6.push(column6.value(i));
            i = i + 1;
        }

        let field1 =  Field::new("bucket", DataType::Float64, false);
        let field2 = Field::new("operator", DataType::Utf8, false);
        let field3 = Field::new("relfreq", DataType::Float64, false);
        let field4 = Field::new("bucketNEG", DataType::Float64, false);
        let field5 = Field::new("operatorNEG", DataType::Utf8, false);
        let field6 = Field::new("relfreqNEG", DataType::Float64, false);

        let schema = Schema::new(vec![field1, field2, field3, field4, field5, field6]);

        let vec1 = Float64Array::from(vec1);
        let vec2 = StringArray::from(vec2);
        let vec3 = Float64Array::from(vec3);
        let vec4 = Float64Array::from(vec4);
        let vec5 = StringArray::from(vec5);
        let vec6 = Float64Array::from(vec6);


        let batch = RecordBatch::try_new(Arc::new(schema), vec![
            Arc::new(vec1),
            Arc::new(vec2),
            Arc::new(vec3),
            Arc::new(vec4),
            Arc::new(vec5),
            Arc::new(vec6)
        ]);


        batch.unwrap()

    }
