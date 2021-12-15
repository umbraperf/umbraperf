use arrow::{record_batch::RecordBatch, array::{GenericStringArray, PrimitiveArray, StringArray, Float64Array, Int32Array, UInt64Array, Int64Array}, datatypes::{Float64Type, UInt64Type, Int32Type, Int64Type}};

pub fn get_stringarray_column(batch: &RecordBatch, column: usize) -> &GenericStringArray<i32> {
    let column = batch
        .column(column)
        .as_any()
        .downcast_ref::<StringArray>()
        .unwrap();
    return column;
}

pub fn get_floatarray_column(batch: &RecordBatch, column: usize) -> &PrimitiveArray<Float64Type> {
    let column = batch
        .column(column)
        .as_any()
        .downcast_ref::<Float64Array>()
        .unwrap();
    return column;
}

pub fn get_uint_column(batch: &RecordBatch, column: usize) -> &PrimitiveArray<UInt64Type> {
    let column = batch
        .column(column)
        .as_any()
        .downcast_ref::<UInt64Array>()
        .unwrap();
    return column;
}

pub fn get_int32_column(batch: &RecordBatch, column: usize) -> &PrimitiveArray<Int32Type> {
    let column = batch
        .column(column)
        .as_any()
        .downcast_ref::<Int32Array>()
        .unwrap();
    return column;
}

pub fn get_int64_column(batch: &RecordBatch, column: usize) -> &PrimitiveArray<Int64Type> {
    let column = batch
        .column(column)
        .as_any()
        .downcast_ref::<Int64Array>()
        .unwrap();
    return column;
}