pub struct Analyze_API {
}


impl Analyze_API {

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


    // Filters?
    // Which columns?
    // Sorted? (Abc,cba or like in file)
    // Operations (Count, Sum)
    pub fn analyze(query: &str) {
        let s: String = "test";
        let split = string.split(",");

    }
    
}