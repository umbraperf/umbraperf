


export enum SqlQueries{

    get_operators = "select operators from xy",
    get_events = 'select distinct ev_name from yx',
    get_operator_frequency_per_event = "select operator, count(operator) from xy group by operator where ev_name = eventVonJs",
    test = "select operator, count(operator) from xy  where ev_name = 'eventVonJs' group by operator",
    other = "other"

}