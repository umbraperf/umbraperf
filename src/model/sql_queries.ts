
export type SqlQuery<T, P> = {
    readonly type: T;
    readonly data: P;
};

export enum SqlQueryType {
    GET_EVENTS = "GET_EVENTS",
    GET_OPERATOR_FREQUENCY_PER_EVENT = "GET_OPERATOR_FREQUENCY_PER_EVENT",
    get_operators = "select operators from xy",
    get_events = 'select distinct ev_name from yx',
    get_operator_frequency_per_event = "select operator, count(operator) from xy group by operator where ev_name = 'eventVonJs'",
    test = "select operator, count(operator) from xy group by operator where ev_name = eventVonJs",
    other = "other"
}

export type QueryVariant =
    | SqlQuery<SqlQueryType.GET_EVENTS, {}>
    | SqlQuery<SqlQueryType.GET_OPERATOR_FREQUENCY_PER_EVENT, { event: string }>;


export function createSqlQuery(query: QueryVariant) {

    switch (query.type) {
        case SqlQueryType.GET_EVENTS:
            return 'select distinct ev_name from yx';
        case SqlQueryType.GET_OPERATOR_FREQUENCY_PER_EVENT:
            return `select operator, count(operator) from xy where ev_name = '${query.data.event}' group by operator`;
    }
}


