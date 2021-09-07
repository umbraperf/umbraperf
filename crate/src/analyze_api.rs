     use std::collections::BTreeMap;

use arrow::datatypes::DataType;
use arrow::record_batch::RecordBatch;
use sqlparser::ast::{Expr, SelectItem, SetExpr};
use sqlparser::dialect::GenericDialect;
use sqlparser::parser::Parser;

use crate::bindings::notify_js_query_result;
use crate::record_batch_util::RecordBatchUtil;
use crate::{analyze, print_to_js, print_to_js_with_obj};

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

    // SELECT
    pub fn execute_projections(batch: RecordBatch, projections: &Vec<SelectItem>) -> RecordBatch  {

        let mut vec = Vec::new();

        for projection in projections {
            match projection {
                SelectItem::UnnamedExpr(expr) => {
                    match expr {
                        Expr::Identifier(ident) => {
                            let name = &ident.value;
                            let column_num = get_column_num(name.as_str());
                            vec.push(column_num);
                            print_to_js_with_obj(&format!("{:?}", name).into());
                        }
                        Expr::Function(func) => {
                           let func_name = &func.name;
                           let func = &func_name.0;
                           let ident = &func[0];
                           let str = &ident.value;
                           // TODO
                          vec.push(1 as usize);
                        }
                        _ => {
                           // ignore
                        }
                    }
                }
                _ => {
                    //ignore
                }
            }
        }

        let record_batch = analyze::get_columns(batch, vec);
        
        record_batch

    }

    // WHERE
    pub fn execute_selections(selection: Option<Expr>, record_batch: RecordBatch) -> RecordBatch {

        if let Some(expr) = selection {
            if let Expr::BinaryOp{left: l, op: op, right: r} = expr {
                let mut column_num = 0;
                let mut filter_str = "";
                if let sqlparser::ast::BinaryOperator::Eq = op {   
                    if let Expr::Identifier(ident)  = l.as_ref() {
                        column_num = get_column_num(ident.value.as_str());
                    }
                    if let Expr::Value(value) = r.as_ref() {
                        if let sqlparser::ast::Value::SingleQuotedString(str) = value {
                            filter_str = str;
                            print_to_js_with_obj(&format!("{:?}", filter_str).into());
                        }
                    }
                }
                return analyze::filter_with(column_num, filter_str, &record_batch);
            } 
        }
        return record_batch;
    }
        	
    // DISTINCT
    pub fn execute_distinct(batch: RecordBatch, is_distinct: bool) -> RecordBatch {

        if is_distinct == true {
            let unique_batch = analyze::find_unique_string(&batch, 0);
            return unique_batch;
        }

        batch

    }

    // GROUPBY
    pub fn execute_group_by(batch: RecordBatch, projections: &Vec<SelectItem>, group_by: Vec<Expr>) -> RecordBatch {

        if group_by.len() > 0 {
            let expr = &group_by[0];
            if let Expr::Identifier(ident) = expr {
                let column_num = get_column_num(ident.value.as_str());
                print_to_js_with_obj(&format!("{:?}", ident.value.as_str()).into());
                return analyze::count_rows_over(&batch, column_num, column_num);
            } else {
                return batch;
            }
        } else {
            return batch;
        }
    }

    // for fast query exection:
    // 1. filters first
    // Order of a sql statement: https://www.designcise.com/web/tutorial/what-is-the-order-of-execution-of-an-sql-query
    // 0) CONVERT
    // 1) WHERE
    // 2) GROUPBY
    // 3) SELECT -- select is here first as it converts the vector of record batches also to one batch
    // 4) DISTINCT
    // 5) ORDERBY
    pub fn execute_query(batches: Vec<RecordBatch>, projections: Vec<SelectItem>, selection: Option<Expr>, group_by: Vec<Expr>, sort_by: Vec<Expr>, is_distinct: bool) {

        // ****************************************************
        let convert = analyze::convert(batches);

        print_to_js("After converting:");

        print_to_js_with_obj(&format!("{:?}", convert).into());

        // WHERE
        let filter = execute_selections(selection, convert); // 1

        print_to_js("After filter:");

        print_to_js_with_obj(&format!("{:?}", filter).into());
        
        // GROUPBY
        let group_by = execute_group_by(filter, &projections, group_by); // 2

        print_to_js("After group by:");

        print_to_js_with_obj(&format!("{:?}", group_by).into());

        // SELECT
        let select = execute_projections(group_by, &projections); // Vec<RecordBatch> -> RecordBatch // 3

        print_to_js("After selection:");

        print_to_js_with_obj(&format!("{:?}", select).into());

        // DISTINCT
        let distinct = execute_distinct(select, is_distinct); // 4

        print_to_js("After distinct:");

        print_to_js_with_obj(&format!("{:?}", distinct).into());

        // ****************************************************


        let event_cursor = RecordBatchUtil::write_record_batch_to_cursor(&distinct);

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

        print_to_js("Query syntax is correct.");


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
    
