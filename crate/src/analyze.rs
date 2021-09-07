use arrow::{array::{Array, ArrayRef, BooleanArray, Float64Array, Int64Array, PrimitiveArray, StringArray}, compute::{sort, sort_to_indices, sum, take}, datatypes::{DataType, Field, Float64Type, Schema}, record_batch::RecordBatch};
use log::Record;
use std::{collections::{BTreeMap}, sync::Arc};
use arrow::error::Result as ArrowResult;
use crate::{print_to_js, print_to_js_with_obj};


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

        let mut vec = Vec::new();

        for array in to_concat_array {
            let concat_array = arrow::compute::kernels::concat::concat(&array);
            vec.push(concat_array.unwrap());
        }

        let batch = RecordBatch::try_new(batches[0].schema(), vec).unwrap();

        batch
        
    }


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

        let batch = RecordBatch::try_new(Arc::new(new_schema), vec).unwrap();
        batch
    }

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
    
        RecordBatch::try_new(batch.schema(), arrays).unwrap()
        
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

    pub fn find_unique_string(batch: &RecordBatch, column_index_for_unqiue: usize) -> RecordBatch {

        let vec = batch.column(column_index_for_unqiue)
            .as_any()
            .downcast_ref::<StringArray>()
            .unwrap();
        
        let mut str_vec = Vec::new();
        
        for item in vec {
            if let Some(x) = item {
                str_vec.push(x);
            }
        }

        str_vec.sort();

        str_vec.dedup();

        let array = StringArray::from(str_vec);

        let schema = batch.schema();

        let field = schema.field(column_index_for_unqiue);

        let new_schema = Schema::new(vec![field.to_owned()]);
            
        RecordBatch::try_new(Arc::new(new_schema), vec![Arc::new(array)]).unwrap()

    }

    pub fn count_rows_over(batch: &RecordBatch, column_to_groupby_over: usize, column_to_sum_over: usize) -> RecordBatch {

        let unique_batch = find_unique_string(batch, column_to_groupby_over);

        // Vector of unique strings
        let vec = unique_batch
        .column(0)
        .as_any()
        .downcast_ref::<StringArray>()
        .unwrap();
    
        // For each unique string there will be one result, therefore vec.len()
        let mut result_builder =  Float64Array::builder(vec.len());  
    
        for group in vec {
            // Filter unique string as filter_str
            let group_batch = filter_with(column_to_groupby_over, group.unwrap(), batch);
    
            let row_count = group_batch.num_rows() as f64;
    
             result_builder.append_value(row_count);
        } 

        let builder = result_builder.finish();

        // old_schema + new count field
        let field = Field::new("operator", DataType::Utf8, false);        
        let result_field = Field::new("count", DataType::Float64, false);

        let schema = Schema::new(vec![field, result_field]);

        let vec = unique_batch.column(0).to_owned();

        RecordBatch::try_new(Arc::new(schema), vec![vec, Arc::new(builder)]).unwrap()

    }

    pub fn sum_rows_over(batch: &RecordBatch, column_to_groupby_over: usize, column_to_sum_over: usize) {

        let vec = find_unique_with_sort(batch, column_to_groupby_over);

        let mut builder =  Float64Array::builder(vec.len());  
    
        for group in &vec {
            let mut group_index = 0;
            let group_batch = filter_with(column_to_groupby_over, "t", batch);
    
            let array = group_batch.column(column_to_sum_over)
            .as_any()
            .downcast_ref::<Float64Array>()
            .unwrap();
            let sum = sum(array).unwrap() ;
    
             builder.append_value(sum);

        } 
    
    }
