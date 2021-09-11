use arrow::record_batch::RecordBatch;
use sqlparser::ast::{Expr, SelectItem, SetExpr};
use sqlparser::dialect::GenericDialect;
use sqlparser::parser::Parser;

// Crates
use crate::bindings::notify_js_query_result;
use crate::record_batch_util::RecordBatchUtil;
use crate::{analyze, print_to_js, print_to_js_with_obj};

// Find name in Record Batch
fn find_name(name: &str, batch: &RecordBatch) -> usize {
    let schema = batch.schema();
    let fields = schema.fields();

    for (i, field) in fields.iter().enumerate() {
        if field.name() == name {
            return i;
        }
    }
    return 0;
}

// SELECT
pub fn exec_projections(batch: RecordBatch, projections: &Vec<SelectItem>) -> RecordBatch {
    let mut vec = Vec::new();

    for projection in projections {
        match projection {
            SelectItem::UnnamedExpr(expr) => {
                match expr {
                    Expr::Identifier(ident) => {
                        let name = &ident.value;
                        let column_num = find_name(name.as_str(), &batch);
                        vec.push(column_num);
                        print_to_js_with_obj(&format!("{:?}", name).into());
                    }
                    Expr::Function(func) => {
                        let func_name = &func.name;
                        let func = &func_name.0;
                        let ident = &func[0];
                        let str = &ident.value;
                        // TODO
                        vec.push(find_name(str, &batch));
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
pub fn exec_selections(selection: Option<Expr>, record_batch: RecordBatch) -> RecordBatch {
    if let Some(expr) = selection {
        if let Expr::BinaryOp {
            left: l,
            op,
            right: r,
        } = expr
        {
            let mut column_num = 0;
            let mut filter_str = "";
            if let sqlparser::ast::BinaryOperator::Eq = op {
                if let Expr::Identifier(ident) = l.as_ref() {
                    column_num = find_name(ident.value.as_str(), &record_batch);
                }
                if let Expr::Value(value) = l.as_ref() {
                    if let sqlparser::ast::Value::SingleQuotedString(str) = value {
                        filter_str = str;
                    }
                }
                if let Expr::Identifier(ident) = r.as_ref() {
                    column_num = find_name(ident.value.as_str(), &record_batch);
                }
                if let Expr::Value(value) = r.as_ref() {
                    if let sqlparser::ast::Value::SingleQuotedString(str) = value {
                        filter_str = str;
                    }
                }
            }
            return analyze::filter_with(column_num, filter_str, &record_batch);
        }
    }
    return record_batch;
}

// DISTINCT
pub fn exec_distinct(batch: RecordBatch, is_distinct: bool) -> RecordBatch {
    if is_distinct == true {
        let unique_batch = analyze::find_unique_string(&batch, 0);
        return unique_batch;
    }

    batch
}

// GROUPBY
pub fn exec_group_by(
    batch: RecordBatch,
    projections: &Vec<SelectItem>,
    group_by: Vec<Expr>,
    range_str: &str,
) -> Vec<RecordBatch> {
    let mut record_batch_vec = Vec::new();

    if group_by.len() == 1 {
        let expr = &group_by[0];
        if let Expr::Identifier(ident) = expr {
            let column_num = find_name(ident.value.as_str(), &batch);
            print_to_js_with_obj(&format!("{:?}", ident.value.as_str()).into());
            // if group by operator is count (TODO when is sum  )
            let record_batch = analyze::count_rows_over(&batch, column_num);
            record_batch_vec.push(record_batch);
            return record_batch_vec;
        } else {
            record_batch_vec.push(batch);
            return record_batch_vec;
        }
    } else if group_by.len() == 2 {
        let expr1 = &group_by[0];
        let expr2 = &group_by[1];
        if let Expr::Identifier(ident1) = expr1 {
            if let Expr::Identifier(ident2) = expr2 {
                let column_num1 = find_name(ident1.value.as_str(), &batch);
                let column_num2 = find_name(ident2.value.as_str(), &batch);

                print_to_js_with_obj(&format!("{:?}", "IN GROUP BY").into());

                let split: Vec<&str> = range_str.split_terminator(":").collect();
                let column = split[0].replace("{", "").replace(" ", "");
                let column_as_usize = find_name(&column, &batch);
                let range = split[1].replace("}", "").replace(" ", "");
                let range_as_f64 = range.parse::<f64>().unwrap();

                // TODO COLUMN FOR BUCKET
                let batch = analyze::rel_freq_in_bucket_of_operators_new(
                    &batch,
                    2 as usize,
                    column_num2,
                    range_as_f64,
                    column_as_usize,
                );
                record_batch_vec.push(batch);
                return record_batch_vec;
            }
        }
        record_batch_vec.push(batch);
        return record_batch_vec;
    } else if group_by.len() == 3 {
        let expr1 = &group_by[0];
        let expr2 = &group_by[1];
        let expr3 = &group_by[2];
        if let Expr::Identifier(ident1) = expr1 {
            if let Expr::Identifier(ident2) = expr2 {
                if let Expr::Identifier(ident3) = expr3 {
                    let column_num1 = find_name(ident1.value.as_str(), &batch);
                    let column_num2 = find_name(ident2.value.as_str(), &batch);
                    let column_num3 = find_name(ident3.value.as_str(), &batch);
                    // let column_num3 = get_column_num(ident2.value.as_str(), &batch);

                    print_to_js_with_obj(&format!("{:?}", "IN GROUP BY").into());

                    let split: Vec<&str> = range_str.split_terminator(":").collect();
                    let column = split[0].replace("{", "").replace(" ", "");
                    let column_as_usize = find_name(&column, &batch);
                    let range = split[1].replace("}", "").replace(" ", "");
                    let range_as_f64 = range.parse::<f64>().unwrap();

                    // TODO COLUMN FOR BUCKET
                    let batch = analyze::rel_freq_in_bucket_of_operators_with_pipelines(
                        &batch,
                        2 as usize,
                        column_num2,
                        range_as_f64,
                        column_as_usize,
                        column_num3,
                    );
                    return batch;
                }
            }
        }
        record_batch_vec.push(batch);
        return record_batch_vec;
    } else {
        record_batch_vec.push(batch);
        return record_batch_vec;
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
pub fn exec_query(
    batches: RecordBatch,
    projections: Vec<SelectItem>,
    selection: Option<Expr>,
    group_by: Vec<Expr>,
    is_distinct: bool,
    range_str: &str,
) {
    // ****************************************************

    // WHERE
    let filter = exec_selections(selection, batches); // 1

    print_to_js("After filter:");

    print_to_js_with_obj(&format!("{:?}", filter).into());

    // GROUPBY
    let group_by = exec_group_by(filter, &projections, group_by, range_str); // 2

    print_to_js("After group by:");

    print_to_js_with_obj(&format!("{:?}", group_by).into());

    if group_by.len() == 1 {
        // SELECT
        let select = exec_projections(group_by[0].to_owned(), &projections); // Vec<RecordBatch> -> RecordBatch // 3

        print_to_js("After selection:");

        print_to_js_with_obj(&format!("{:?}", select).into());

        // DISTINCT
        let distinct = exec_distinct(select, is_distinct); // 4

        print_to_js("After distinct:");

        print_to_js_with_obj(&format!("{:?}", distinct).into());

        // ****************************************************

        let event_cursor = RecordBatchUtil::write_record_batch_to_cursor(&distinct);

        notify_js_query_result(event_cursor.into_inner());
    } else {
        let event_cursor = RecordBatchUtil::write_record_batches_to_cursor(group_by);

        notify_js_query_result(event_cursor.into_inner())
    }
}

pub fn query(batches: RecordBatch, sql_query: &str, range_str: &str) {
    let dialect = GenericDialect {};
    let ast = Parser::parse_sql(&dialect, sql_query).unwrap();

    // Print AST
    print_to_js("Query syntax is correct.");
    print_to_js_with_obj(&format!("{:?}", ast).into());

    // Only one statement allowed
    for statement in ast {
        if let sqlparser::ast::Statement::Query(query) = statement {
            let body = query.body;
            if let SetExpr::Select(select) = body {
                let is_distinct = select.distinct;
                let projection = select.projection;
                // let from = select.from;
                let selection = select.selection;
                let group_by = select.group_by;
                // let sort_by = select.sort_by;
                exec_query(
                    batches.to_owned(),
                    projection,
                    selection,
                    group_by,
                    is_distinct,
                    range_str,
                );
            }
        }
    }
}
