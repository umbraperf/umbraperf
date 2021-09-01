use arrow::{array::{Array, ArrayRef, BooleanArray, Float64Array, Int64Array, PrimitiveArray, StringArray}, compute::{sort, sort_to_indices, sum, take}, datatypes::{Float64Type}, record_batch::RecordBatch};
use std::{collections::{BTreeMap}};
use arrow::error::Result as ArrowResult;


    pub fn get_columns(batches: Vec<RecordBatch>, column_index: Vec<usize> ) -> RecordBatch {

        let mut map = BTreeMap::<usize, Vec<&dyn Array>>::new();
        for batch in &batches {

            for index in &column_index {

                let array = batch.column(*index).as_ref();
                
                if let Some(x) = map.get(&index) {
                    let mut vec = x.clone();
                    vec.push(array);
                    map.insert(*index, vec);
                } else {
                    let mut vec = Vec::new();
                    vec.push(array);
                    map.insert(*index, vec);
                }
            }

        }

        let mut vec = Vec::new();

        for item in map {
            let concat_array = arrow::compute::kernels::concat::concat(&item.1);
            vec.push(concat_array.unwrap());
        }

        let batch = RecordBatch::try_new(batches.get(0).unwrap().schema(), vec).unwrap();
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

    fn count_rows_over(batch: &RecordBatch, column_to_groupby_over: usize, column_to_sum_over: usize) {

        let vec = find_unique_with_sort(batch, column_to_groupby_over);

        let mut builder =  Float64Array::builder(vec.len());  
    
        for group in &vec {
            let mut group_index = 0;
            let group_batch = filter_with(column_to_groupby_over, "t", batch);
    
            let row_count = group_batch.num_rows() as f64;
    
             builder.append_value(row_count);
        } 
    }

    fn sum_rows_over(batch: &RecordBatch, column_to_groupby_over: usize, column_to_sum_over: usize) {

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
