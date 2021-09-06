     use std::collections::BTreeMap;

use arrow::datatypes::DataType;
use sqlparser::ast::{Expr, SelectItem, SetExpr};
use sqlparser::dialect::GenericDialect;
use sqlparser::parser::Parser;

use crate::print_to_js_with_obj;

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

    // for fast query exection:
    // 1. filters
    pub fn execute_query(projections: Vec<SelectItem>, selection: Option<Expr>, group_by: Vec<Expr>, sort_by: Vec<Expr>) {

        for projection in projections {
            match projection {
                SelectItem::UnnamedExpr(expr) => {
                    match expr {
                        Expr::Identifier(ident) => {
                            let name = ident.value;
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
        	
    }
    
    
    // Filters?
    // Which columns?
    // Sorted? (Abc,cba or like in file)
    // Operations (Count, Sum)
    // 
    // select is required
    // from and where are optional
    pub fn query(sql_query: &str) {

        let dialect = GenericDialect {};

        let ast = Parser::parse_sql(&dialect, sql_query).unwrap();

        print_to_js_with_obj(&format!("{:?}", ast).into());
        
        for statement in ast {
            match statement {
                sqlparser::ast::Statement::Query(query) => {
                    let body = query.body;
                    match body {
                        SetExpr::Select(select) => {
                            let projection = select.projection;
                            // let from = select.from;
                            let selection = select.selection;
                            let group_by = select.group_by;
                            let sort_by = select.sort_by;
                            execute_query(projection, selection, group_by, sort_by);
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
    
