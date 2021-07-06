extern crate csv;

 use std::error::Error;
 use csv::ReaderBuilder;
 use web_sys::console;

 pub fn example() -> Result<(), Box<Error>> {

    console::log_1(&"Hello using web-sys".into());

     let data = "\
city;country;pop
Boston;United States;4628910
";
     let mut rdr = ReaderBuilder::new()
         .delimiter(b';')
         .from_reader(data.as_bytes());

     if let Some(result) = rdr.records().next() {
         let record = result?;
         console::log_1(&"Test1".into());
         assert_eq!(record, vec!["Boston", "United States", "4628910"]);
         Ok(())
     } else {
        println!("e");
        console::log_1(&"Test2".into());

         Err(From::from("expected at least one record but got none"))
     }
 }
