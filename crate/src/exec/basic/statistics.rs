use std::collections::HashMap;

// Mean
pub fn mean(data: &[i64]) -> Option<f64> {
    let sum = data.iter().sum::<i64>() as f64;
    let count = data.len();

    match count {
        positive if positive > 0 => Some(sum / count as f64),
        _ => None,
    }
}

// Median
pub fn median(numbers: &mut [i64]) -> i64 {
    numbers.sort();
    let mid = numbers.len() / 2;
    numbers[mid]
}

// Mode
pub fn mode(numbers: &[i64]) -> i64 {
    let mut occurrences = HashMap::new();

    for &value in numbers {
        *occurrences.entry(value).or_insert(0) += 1;
    }

    occurrences
        .into_iter()
        .max_by_key(|&(_, count)| count)
        .map(|(val, _)| val)
        .expect("Cannot compute the mode of zero numbers")
}

// Standard deviation
pub fn std_deviation(data: &[i64]) -> Option<f64> {
    match (mean(data), data.len()) {
        (Some(data_mean), count) if count > 0 => {
            let variance = data
                .iter()
                .map(|value| {
                    let diff = data_mean - (*value as f64);

                    diff * diff
                })
                .sum::<f64>()
                / count as f64;

            Some(variance.sqrt())
        }
        _ => None,
    }
}
