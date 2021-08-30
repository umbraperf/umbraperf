use arrow::{array::{Array, ArrayRef, BooleanArray, Float64Array, StringArray}, compute::{filter, sort}, datatypes::{DataType, Float64Type}, record_batch::RecordBatch};
use std::{collections::{BTreeMap, HashMap}};

use crate::{print_to_js, print_to_js_with_obj};

pub struct Analyze {
    btree: BTreeMap<String, (i32, DataType)>,
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

    pub fn get_column_num(&self, name: &str) -> usize {
        let column_num = self.btree.get(&String::from(name));
        let column_num = (column_num.expect("Operator needs to be in the rust list!").0) as usize;
        column_num
    }

    pub fn get_data_type(&self, name: &str) -> DataType {
        let data_type = self.btree.get(&String::from(name));
        let data_type = &data_type.expect("Operator needs to be in the rust list!").1;
        data_type.to_owned()
    }


    pub fn get_columns(self, batches: Vec<RecordBatch>, names: Vec<&str> ) -> RecordBatch {

        let mut map = BTreeMap::<usize, Vec<&dyn Array>>::new();
        for batch in &batches {

            for name in &names {
                let column_num = self.get_column_num(name);

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

    pub fn filter(self, name: &str, filter_str: &str, batch: &RecordBatch) -> RecordBatch {

        let column_num = self.get_column_num(name);
        let data_type = self.get_data_type(name);

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
    
        // Iterate over the columns and apply filter
        for idx in 0..batch.num_columns() {
            let array = batch.column(idx).as_ref();
    
            // Apply filter to column;
            let filtered = filter(array, &filter_array).unwrap();
    
            arrays.push(filtered);
        }
    
        // Create a new record batch from filtered results
        RecordBatch::try_new(batch.schema(), arrays).unwrap()
        
    }

    pub fn sort_batch(batch: &RecordBatch, column_index_to_sort: usize) {
        let mut groups = sort(batch.column(column_index_to_sort), None)
        .unwrap()
        .as_any()
        .downcast_ref::<StringArray>()
        .unwrap();
    }


        

}