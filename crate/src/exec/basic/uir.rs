use arrow::{array::Int64Array, record_batch::RecordBatch};

use crate::{state::state::get_serde_dict, utils::print_to_cons::print_to_js_with_obj, web_file::uir_reader::UIRReader};

pub fn uir(file_length: u64, record_batch: RecordBatch) -> RecordBatch {

    let column = record_batch
        .column(5)
        .as_any()
        .downcast_ref::<Int64Array>()
        .unwrap();

    let dict_dict = get_serde_dict().unwrap();
    print_to_js_with_obj(&format!("{:?}", dict_dict.dict).into());

    print_to_js_with_obj(&format!("{:?}", dict_dict.uri_dict).into());

    return record_batch;

}