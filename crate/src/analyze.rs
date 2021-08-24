use arrow::{array::Array, record_batch::RecordBatch};


pub struct Analyze {
}


impl Analyze {

    pub fn data_for_bar_chart(batch: &RecordBatch) -> (Vec<Option<&str>>, Vec<i32>) {

        use std::collections::HashMap;
        let mut operator_number_map = HashMap::new();


        let column = batch.column(0);
        let arrow = arrow::array::as_string_array(column);

        let column_ev_name = batch.column(1);
        let arrow_event_name = arrow::array::as_string_array(column_ev_name);

        let mut counter = 0;
        while counter < arrow.len() {

            let event = arrow_event_name.value(counter);
            let operator = arrow.value(counter);

            if event.contains("cycles:ppp") {
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


    }
        

}