use arrow::{array::{Array, ArrayRef, BooleanArray, Float64Array, Int64Array, PrimitiveArray, StringArray}, compute::{filter, sort, sort_to_indices, sum, take}, datatypes::{DataType, Float64Type}, record_batch::RecordBatch};
use std::{collections::{BTreeMap, HashMap}, sync::Arc};
use arrow::error::Result as ArrowResult;

use crate::{print_to_js, print_to_js_with_obj};


    // Init map
    pub fn get_dict() -> BTreeMap<String, (i32, DataType)> {
        let mut dict = BTreeMap::new();
        dict.insert(String::from("operator"), (0, DataType::Utf8));
        dict.insert(String::from("ev_name"), (1, DataType::Utf8));
        dict.insert(String::from("time"), (2, DataType::Float64));
        dict.insert(String::from("pipeline"), (3, DataType::Utf8));
        dict
    }

    pub fn get_column_num(name: &str) -> usize {
        let dict = get_dict();
        let column_num = dict.get(&String::from(name));
        let column_num = (column_num.expect("Operator needs to be in the rust list!").0) as usize;
        column_num
    }

    pub fn get_data_type(name: &str) -> DataType {
        let dict = get_dict();
        let data_type = dict.get(&String::from(name));
        let data_type = &data_type.expect("Operator needs to be in the rust list!").1;
        data_type.to_owned()
    }


    pub fn get_columns(batches: Vec<RecordBatch>, names: Vec<&str> ) -> RecordBatch {

        let mut map = BTreeMap::<usize, Vec<&dyn Array>>::new();
        for batch in &batches {

            for name in &names {
                let column_num = get_column_num(name);

                let array = batch.column(column_num).as_ref();
                
                if let Some(x) = map.get(&column_num) {
                    let mut vec = x.clone();
                    vec.push(array);
                    map.insert(column_num, vec);
                } else {
                    let mut vec = Vec::new();
                    vec.push(array);
                    map.insert(column_num, vec);
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

    pub fn filter_with(name: &str, filter_str: &str, batch: &RecordBatch) -> RecordBatch {

        let column_num = get_column_num(name);
        let data_type = get_data_type(name);

        // if data_type == DataType::Utf8 {

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


    pub fn sum_over(batch: &RecordBatch, column_index_to_sum: usize)  {

        let sum = arrow::compute::sum(batch.column(column_index_to_sum).as_any().downcast_ref::<PrimitiveArray<Float64Type>>().unwrap()).unwrap();

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
            let group_batch = filter_with("todo", "t", batch);
    
            let row_count = group_batch.num_rows() as f64;
    
             builder.append_value(row_count);
        } 
    }

    fn sum_rows_over(batch: &RecordBatch, column_to_groupby_over: usize, column_to_sum_over: usize) {

        let vec = find_unique_with_sort(batch, column_to_groupby_over);

        let mut builder =  Float64Array::builder(vec.len());  
    
        for group in &vec {
            let mut group_index = 0;
            let group_batch = filter_with("todo", "t", batch);
    
            let array = group_batch.column(column_to_sum_over)
            .as_any()
            .downcast_ref::<Float64Array>()
            .unwrap();
            let sum = sum(array).unwrap() ;
    
             builder.append_value(sum);

        } 
    
    }
