     use std::collections::BTreeMap;

use arrow::datatypes::DataType;
use arrow::record_batch::RecordBatch;
use sqlparser::ast::{Expr, SelectItem, SetExpr};
use sqlparser::dialect::GenericDialect;
use sqlparser::parser::Parser;

use crate::bindings::notify_js_query_result;
use crate::record_batch_util::RecordBatchUtil;
use crate::{analyze, print_to_js_with_obj};

pub struct Query {
   
}
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

    // TODO MAPPING
    pub fn execute_projections(batches: Vec<RecordBatch>, projections: Vec<SelectItem>) -> RecordBatch  {

        let mut vec = Vec::new();

        for projection in projections {
            match projection {
                SelectItem::UnnamedExpr(expr) => {
                    match expr {
                        Expr::Identifier(ident) => {
                            let name = ident.value;
                            let column_num = get_column_num(name.as_str());
                            vec.push(column_num);
                            print_to_js_with_obj(&format!("{:?}", name).into());
                        }
                        _ => {
                            panic!("Not implemented!");
                        }
                    }
                }
                _ => {
                    panic!("Not implemented!");
                }
            }
        }

        print_to_js_with_obj(&format!("{:?}", vec).into()); 

        let record_batch = analyze::get_columns(batches , vec);
        print_to_js_with_obj(&format!("{:?}", record_batch).into()); 
        
        record_batch

    }

    pub fn execute_selections(selection: Option<Expr>)  {

        if let Some(expr) = selection {
            match expr {
                Expr::BinaryOp{left: l, op: op, right: r} => {

                }
                _ => {
                    panic!("Not implemented!");
                }
            }
        }
        	
    }

    pub fn execute_computations(batch: RecordBatch, is_distinct: bool) -> RecordBatch {

        if is_distinct == true {
            let unique_batch = analyze::find_unique_string(&batch, 0);
            return unique_batch;
        }

        batch

    }

    // for fast query exection:
    // 1. filters
    pub fn execute_query(batches: Vec<RecordBatch>, projections: Vec<SelectItem>, selection: Option<Expr>, group_by: Vec<Expr>, sort_by: Vec<Expr>, is_distinct: bool) {

        let batch = execute_projections(batches, projections); // Vec<RecordBatch> -> RecordBatch

        //execute_selections(selection); // RecordBatch -> RecordBatch

        let batch = execute_computations(batch, is_distinct); //

        print_to_js_with_obj(&format!("{:?}", batch).into());

        let event_cursor = RecordBatchUtil::write_record_batch_to_cursor(&batch);

        notify_js_query_result(event_cursor.into_inner());

   
    }
    
    
    // Filters?
    // Which columns?
    // Sorted? (Abc,cba or like in file)
    // Operations (Count, Sum)
    // 
    // select is required
    // from and where are optional
    pub fn query(batches: Vec<RecordBatch>, sql_query: &str) {

        let dialect = GenericDialect {};

        let ast = Parser::parse_sql(&dialect, sql_query).unwrap();

        print_to_js_with_obj(&format!("{:?}", ast).into());
        
        for statement in ast {
            match statement {
                sqlparser::ast::Statement::Query(query) => {
                    let body = query.body;
                    match body {
                        SetExpr::Select(select) => {
                            let is_distinct = select.distinct;
                            let projection = select.projection;
                            // let from = select.from;
                            let selection = select.selection;
                            let group_by = select.group_by;
                            let sort_by = select.sort_by;
                            execute_query(batches.to_owned(), projection, selection, group_by, sort_by, is_distinct);
                        }
                        _ => {
                            panic!("Not implemented!");
                        }
                    }
                }
                _ => {
                    panic!("Not implemented!");
                }
            }
        }


    }
    
