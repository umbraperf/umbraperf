use arrow::{array::{Array, ArrayData, Float64Builder}, datatypes::{DataType, Float64Type}, record_batch::RecordBatch};
use std::{collections::{BTreeMap}, sync::Arc};

use crate::{print_to_js_with_obj};

pub struct Analyze {
    btree: BTreeMap<String, (i32, DataType)>,
}


pub fn convert_record_batch_to_arrays(batches: Vec<RecordBatch>, column_num: usize) -> Vec<Arc<dyn Array>> {
    let mut vec = Vec::new();
    for batch in &batches {
        let array = batch.column(column_num).to_owned();
        vec.push(array);
    }
    vec
}

pub fn convert_arrays_to_one_arraydata(array: Vec<Arc<dyn Array>>, data_type: DataType) -> ArrayData {

    let mut array_data_builder = arrow::array::ArrayDataBuilder::new(data_type);

    for item in array {
        array_data_builder = array_data_builder.add_child_data(item.data().to_owned());
    }

    array_data_builder.build()

}


impl Analyze {

    // Init map
    pub fn new() -> Self {
        let mut dict = BTreeMap::new();
        dict.insert(String::from("operator"), (0, DataType::Utf8));
        dict.insert(String::from("ev_name"), (1, DataType::Utf8));
        dict.insert(String::from("time"), (2, DataType::Float64));
        dict.insert(String::from("pipeline"), (3, DataType::Utf8));
        Self {
            btree: dict
        }
    }

    
    

    pub fn get_columns(self, batches: Vec<RecordBatch>, names: Vec<&str> ) {

 
        for name in names {
            let column_num = self.btree.get(&String::from(name));
            let column_num = (column_num.expect("Operator needs to be in the rust list!").0) as usize;

            let data_type = self.btree.get(&String::from(name));
            let data_type = &data_type.expect("Operator needs to be in the rust list!").1;

            match data_type {
                DataType::Utf8 => {
                    let array = convert_record_batch_to_arrays(batches.to_owned(), column_num);
                    



                    let array_data = convert_arrays_to_one_arraydata(array, DataType::Utf8); 
                    let string_array = arrow::array::StringArray::from(array_data);
                    print_to_js_with_obj(&format!("{:?}", string_array).into());
                    
                }
                DataType::Float64 => {

                    let array = convert_record_batch_to_arrays(batches.to_owned(), column_num);
                    print_to_js_with_obj(&format!("{:?}", array).into());
                    let array_data = convert_arrays_to_one_arraydata(array, DataType::Float64);   
                    print_to_js_with_obj(&format!("{:?}", array_data).into());
                    let float_array = arrow::array::PrimitiveArray::<Float64Type>::from(array_data);
                    print_to_js_with_obj(&format!("{:?}", float_array).into());


                }
                _ => {
                    panic!();
                }
            }
          
    } 
    }
   /*  // TODO, maybe later metadata request at the beginning to get most important data
    // pub fn meta_data()
    pub fn events(batch: &RecordBatch) -> Vec<Option<&str>> {

        let mut operator_number_map = BTreeMap::new();

        let column_ev_name = batch.column(1);
        let arrow_event_name = arrow::array::as_string_array(column_ev_name);

        let mut counter = 0;
        while counter < arrow_event_name.len() {

            let event = arrow_event_name.value(counter);

            if let Some(sum) = operator_number_map.get(event) {
                operator_number_map.insert(event, sum + 1);
            } else {
                operator_number_map.insert(event, 1);
            }
            counter += 1;
        }

        let mut k_vec = Vec::new();

        for (k, &v) in operator_number_map.iter() {
            k_vec.push(Some(*k));
        }

        k_vec

    }

    // TODO pipeline will not be given and return an array of pipelines
    pub fn data_for_swim_line(batch: &RecordBatch, event_name: &str, pipeline_name: &str, bucket_size: f64) {

        print_to_js_with_obj(&format!("{:?}", &batch).into()); 


        let mut bucket_map = Vec::new();
        let mut operator_number_per_bucket = BTreeMap::new();

        let column_operator = batch.column(0);
        let column_time = batch.column(2);

        // Filter
        let column_event = batch.column(1);
        let column_pipeline = batch.column(3);

        let arrow_operator_arr =  arrow::array::as_string_array(column_operator);
        let arrow_time_arr = arrow::array::as_primitive_array::<Float64Type>(column_time);

        // Filter
        let arrow_event_arr = arrow::array::as_string_array(column_event);
        let arrow_pipeline_arr = arrow::array::as_string_array(column_pipeline);

        print_to_js_with_obj(&format!("{:?}", arrow_operator_arr).into()); 



        let mut index = 0;
        let mut bucket_to_time: f64 = -1.;
        let mut bucket_number = 0;
        while index < arrow_operator_arr.len() {

            print_to_js_with_obj(&format!("{:?}", bucket_to_time).into()); 

            // Init time
            if bucket_to_time == -1. {
                bucket_to_time = bucket_size;
            } else {
                if arrow_time_arr.value(index) <= bucket_to_time {

                } else {
                    bucket_map.push((bucket_number, operator_number_per_bucket));
                    operator_number_per_bucket = BTreeMap::new();
                    while arrow_time_arr.value(index) > bucket_to_time {
                        bucket_to_time = bucket_to_time + bucket_size;
                        bucket_number = bucket_number + 1;
                    }
                   
                }
               
            }

            //let event = arrow_event_arr.value(index);
            let operator = arrow_pipeline_arr.value(index);
            print_to_js_with_obj(&format!("{:?}", operator).into()); 


            // TODO FILTER THIS
            if true {//event.contains(event_name) && operator.contains(pipeline_name) {
                if let Some(sum) = operator_number_per_bucket.get(operator) {
                    operator_number_per_bucket.insert(operator, sum + 1);
                } else {
                    operator_number_per_bucket.insert(operator, 1);
                }
            }
            index += 1;
        }
        bucket_map.push((bucket_number, operator_number_per_bucket));

        print_to_js_with_obj(&format!("{:?}", bucket_map).into()); 





    }

    pub fn data_for_bar_chart<'a>(batch: &'a RecordBatch, event_name: &'a str) -> (Vec<Option<&'a str>>, Vec<i32>) {

        let mut operator_number_map = BTreeMap::new();

        let column = batch.column(0);
        let arrow = arrow::array::as_string_array(column);

        let column_ev_name = batch.column(1);
        let arrow_event_name = arrow::array::as_string_array(column_ev_name);

        let mut counter = 0;
        while counter < arrow.len() {

            let event = arrow_event_name.value(counter);
            let operator = arrow.value(counter);

            if event.contains(event_name) {
                if let Some(sum) = operator_number_map.get(operator) {
                    operator_number_map.insert(operator, sum + 1);
                } else {
                    operator_number_map.insert(operator, 1);
                }
            }
            counter += 1;
        }

        let mut k_vec = Vec::new();
        let mut v_vec = Vec::new();
        for (k, &v) in operator_number_map.iter() {
            k_vec.push(Some(*k));
            v_vec.push(v);
        }

        let string_vec = k_vec;

        let int_vec = v_vec;

        let tuple = (string_vec, int_vec);

        tuple


    } */
        

}