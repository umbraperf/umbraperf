pub fn split_at_excl_mark(params: &str) -> Vec<&str> {
    return params.split_terminator("!").collect::<Vec<&str>>();
}

pub fn split_at_question_mark(params: &str) -> Vec<&str> {
    return params.split_terminator("?").collect::<Vec<&str>>();
}

pub fn split_at_colon(params: &str) -> Vec<&str> {
    return params.split_terminator(":").collect::<Vec<&str>>();
}

pub fn split_at_comma(params: &str) -> Vec<&str> {
    return params.split_terminator(",").collect::<Vec<&str>>();
}

pub fn split_at_and(params: &str) -> Vec<&str> {
    return params.split_terminator("&").collect::<Vec<&str>>();
}

pub fn split_at_double_and(params: &str) -> Vec<&str> {
    return params.split_terminator("&&").collect::<Vec<&str>>();
}

pub fn split_at_to(params: &str) -> Vec<&str> {
    return params.split_terminator("from_to").collect::<Vec<&str>>();
}

pub fn split_at_numop(params: &str) -> Vec<&str> {
    return params.split_terminator("#").collect::<Vec<&str>>();
}
