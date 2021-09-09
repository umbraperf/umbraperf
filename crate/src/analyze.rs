use arrow::{array::{Array, ArrayRef, BooleanArray, Float64Array, GenericStringArray, Int64Array, LargeStringArray, PrimitiveArray, StringArray}, compute::{sort, sort_to_indices, sum, take}, datatypes::{DataType, Field, Float64Type, Schema, SchemaRef}, record_batch::RecordBatch};
use std::{collections::{HashSet}, sync::Arc};
use arrow::error::Result as ArrowResult;
use crate::{print_to_js, print_to_js_with_obj};


    fn create_record_batch(schema: SchemaRef, columns: Vec<ArrayRef>) -> RecordBatch {
        return RecordBatch::try_new(schema, columns).unwrap();
    }


    // 0
    // Converts Vec<RecordBatch> to one whole RecordBatch
    pub fn convert(batches: Vec<RecordBatch>) -> RecordBatch {

        let number_columns = batches[0].num_columns() as i32;

        let mut to_concat_array = Vec::new();

        for i in 0..number_columns {
            let mut array_vec = Vec::new();
            for batch in &batches {
                array_vec.push(batch.column(i as usize).as_ref());
            }
            to_concat_array.push(array_vec);
        }

        let mut columns = Vec::new();

        for array in to_concat_array {
            let concat_array = arrow::compute::kernels::concat::concat(&array);
            columns.push(concat_array.unwrap());
        }

        create_record_batch(batches[0].schema(), columns)
        
    }

    // 1
    // WHERE
    pub fn filter_with(column_num: usize, filter_str: &str, batch: &RecordBatch) -> RecordBatch {

        let filter_array = batch
            .column(column_num)
            .as_any()
            .downcast_ref::<StringArray>()
            .unwrap()
            .iter()
            .map(|value| Some(value == Some(filter_str)))
            .collect::<BooleanArray>();
    
        let mut arrays: Vec<ArrayRef> = Vec::new();
    
        for idx in 0..batch.num_columns() {
            let array = batch.column(idx).as_ref();
    
            let filtered = arrow::compute::filter(array, &filter_array).unwrap();
    
            arrays.push(filtered);
        }
    
        create_record_batch(batch.schema(), arrays)
        
    }

    pub fn filter_with_number(column_num: usize, filter_float: f64, batch: &RecordBatch) -> RecordBatch {

        let filter_array = batch
            .column(column_num)
            .as_any()
            .downcast_ref::<Float64Array>()
            .unwrap()
            .iter()
            .map(|value| Some(value == Some(filter_float)))
            .collect::<BooleanArray>();
    
        let mut arrays: Vec<ArrayRef> = Vec::new();
    
        for idx in 0..batch.num_columns() {
            let array = batch.column(idx).as_ref();
    
            let filtered = arrow::compute::filter(array, &filter_array).unwrap();
    
            arrays.push(filtered);
        }
    
        create_record_batch(batch.schema(), arrays)
        
    }

    // 2
    // GROUPBY
    pub fn count_rows_over(batch: &RecordBatch, column_to_groupby_over: usize) -> RecordBatch {

        let unique_batch = find_unique_string(batch, column_to_groupby_over);

        // Vector of unique strings
        let vec = unique_batch
        .column(0)
        .as_any()
        .downcast_ref::<StringArray>()
        .unwrap();
    
        // For each *unique* string there will be one result, therefore vec.len()
        let mut result_builder =  Float64Array::builder(vec.len());  
    
        for group in vec {
            // Filter unique string as filter_str
            let group_batch = filter_with(column_to_groupby_over, group.unwrap(), batch);
    
            let row_count = group_batch.num_rows() as f64;
    
             result_builder.append_value(row_count);
        } 

        let builder = result_builder.finish();

        let schema = batch.schema();
        let column_to_group_over_name = schema.field(column_to_groupby_over).name();
        // old_schema + new count field
        let field = Field::new(column_to_group_over_name, DataType::Utf8, false);        
        let result_field = Field::new("count", DataType::Float64, false);

        let schema = Schema::new(vec![field, result_field]);

        let vec = unique_batch.column(0).to_owned();

        RecordBatch::try_new(Arc::new(schema), vec![vec, Arc::new(builder)]).unwrap()

    }

    pub fn rel_freq_in_bucket_of_operators(batch: &RecordBatch, column_for_bucket: usize, column_for_operator: usize) -> RecordBatch  {

        let unique_bucket = find_unique_numbers(batch, column_for_bucket);
        print_to_js_with_obj(&format!("{:?}", unique_bucket).into());

        let unique_operator = find_unique_string(batch, column_for_operator);
        print_to_js_with_obj(&format!("{:?}", unique_operator).into());

        // Vector of unique numbers
        let vec_bucket = unique_bucket
        .column(0)
        .as_any()
        .downcast_ref::<Float64Array>()
        .unwrap();  

        // Vector of unique strings
        let vec_operator = unique_operator
        .column(0)
        .as_any()
        .downcast_ref::<StringArray>()
        .unwrap();
      
        // For each *unique* string there will be one result, therefore vec.len()
        let mut result_bucket =  Float64Array::builder(vec_operator.len() * vec_bucket.len());  
        let mut result_vec_operator = Vec::new();
        let mut result_builder =  Float64Array::builder(vec_operator.len() * vec_bucket.len());  

        for bucket in vec_bucket {
            let bucket_num = bucket.unwrap();
            let bucket_batch = filter_with_number(column_for_bucket, bucket_num, batch);
            let bucket_size = bucket_batch.column(0).len();
            for operator in vec_operator {
                let operator_str = operator.unwrap();
                let operator = filter_with(column_for_operator, operator_str, &bucket_batch);
                let operator_size =  operator.column(0).len();

                result_bucket.append_value(bucket_num);
                result_vec_operator.push(operator_str);
                result_builder.append_value(operator_size as f64 / bucket_size as f64);
            }
        }


        let builder_bucket = result_bucket.finish();
        let operator_arr = StringArray::from(result_vec_operator);
        let builder_result = result_builder.finish();
        print_to_js_with_obj(&format!("{:?}", builder_result).into());


        let schema = batch.schema();
        let column_for_bucket_name = schema.field(column_for_bucket).name();
        let column_for_operator_name = schema.field(column_for_operator).name();

        let field_bucket = Field::new(column_for_bucket_name, DataType::Float64, false);        
        let field_operator = Field::new(column_for_operator_name, DataType::Utf8, false);        
        let result_field = Field::new("relFreq", DataType::Float64, false);

        let schema = Schema::new(vec![field_bucket, field_operator, result_field]);

        RecordBatch::try_new(Arc::new(schema), vec![Arc::new(builder_bucket), Arc::new(operator_arr), Arc::new(builder_result)]).unwrap()

    }


    // 3
    // SELECTION
    pub fn get_columns(batch: RecordBatch, column_index: Vec<usize> ) -> RecordBatch {

        let mut vec = Vec::new();
        
        for index in &column_index {

            let array = batch.column(*index).to_owned();
                
            vec.push(array);
        }

        let mut fields = Vec::new();
        let old_schema = batch.schema();

        for index in &column_index {
            fields.push(old_schema.field(*index).to_owned());
        }

        let new_schema = Schema::new(fields);

        create_record_batch(Arc::new(new_schema), vec)

    }

    // 4
    // DISTINCT
    pub fn find_unique_string(batch: &RecordBatch, column_index_for_unqiue: usize) -> RecordBatch {


        let vec = batch.column(column_index_for_unqiue)
            .as_any()
            .downcast_ref::<StringArray>()
            .unwrap();
                
        let hash_set = vec.into_iter()
        .map(|item| item.unwrap())
        .collect::<HashSet<&str>>()
        .into_iter()
        .collect::<Vec<&str>>();


        let array = StringArray::from(hash_set);

        let schema = batch.schema();

        let field = schema.field(column_index_for_unqiue);

        let new_schema = Schema::new(vec![field.to_owned()]);
            
        RecordBatch::try_new(Arc::new(new_schema), vec![Arc::new(array)]).unwrap()

    }

      // 4
    // DISTINCT
    pub fn find_unique_numbers(batch: &RecordBatch, column_index_for_unqiue: usize) -> RecordBatch {

    let vec = batch.column(column_index_for_unqiue)
        .as_any()
        .downcast_ref::<Float64Array>()
        .unwrap();
    
    let mut str_vec = Vec::new();
    
    for item in vec {
        if let Some(x) = item {
            str_vec.push(x);
        }
    }

    str_vec.sort_by_key(|k| (k * 100.0) as i64);

    str_vec.dedup();

    let array = Float64Array::from(str_vec);

    let schema = batch.schema();

    let field = schema.field(column_index_for_unqiue);

    let new_schema = Schema::new(vec![field.to_owned()]);
        
    RecordBatch::try_new(Arc::new(new_schema), vec![Arc::new(array)]).unwrap()


    }

 
    pub fn sort_batch(batch: &RecordBatch, column_index_to_sort: usize) -> RecordBatch {

        // if data_type == DataType::Utf8 {
        let options = arrow::compute::SortOptions{
            descending: true,
            nulls_first: false,
        };

        let indices = sort_to_indices(batch.column(column_index_to_sort), Some(options), None).unwrap();

        RecordBatch::try_new(
            batch.schema(),batch
                .columns()
                .iter()
                .map(|column| take(column.as_ref(), &indices, None))
                .collect::<ArrowResult<Vec<ArrayRef>>>().unwrap(),
        ).unwrap()
        
    }


    pub fn sum_over(batch: &RecordBatch, column_index_to_sum: usize) -> f64  {

        let sum = arrow::compute::sum(batch.column(column_index_to_sum).as_any().downcast_ref::<PrimitiveArray<Float64Type>>().unwrap()).unwrap();
        sum
    }

    pub fn find_unique_with_sort(batch: &RecordBatch, column_index_for_unqiue: usize) -> Vec<i64> {

        let mut vec = sort(batch.column(column_index_for_unqiue), None).unwrap()
            .as_any()
            .downcast_ref::<Int64Array>()
            .unwrap()
            .values()
            .to_vec();

        vec.dedup();

        vec

    }

    pub fn add_range_to_batch(batch: &RecordBatch, range: f64, column_for_range: usize) -> RecordBatch {

        print_to_js_with_obj(&format!("{:?}", column_for_range).into());

        // Get the column for the range
        let range_column = batch.column(column_for_range)
        .as_any()
        .downcast_ref::<Float64Array>()
        .unwrap();

        let mut range_builder =  Float64Array::builder(range_column.len());  

        // Building a range column
        let mut range_counter = range as f64;
        for item in range_column {
            let item = item.unwrap();
            while item > range_counter {
                range_counter += range;
            } 
            range_builder.append_value(range_counter);
        }

        let builder = range_builder.finish();

        print_to_js_with_obj(&format!("{:?}", builder).into());

        // Creating new record batch with special fields
        let mut vec_field = Vec::new();
        let new_field = Field::new("range", DataType::Float64,false);
        let schema = batch.schema();
        let batch_fields = schema.fields();
        for field in batch_fields {
            vec_field.push(field.to_owned());
        }
        vec_field.push(new_field);
        
        // Setting old columns and adding new column
        let mut vec = Vec::new();
        let batch_columns = batch.columns();
        for column in batch_columns {
            vec.push(column.to_owned());
        }
        vec.push(Arc::new(builder));

        let schema = Arc::new(Schema::new(vec_field.to_owned()));

        let batch = RecordBatch::try_new(schema, vec).unwrap();

        batch

    }

