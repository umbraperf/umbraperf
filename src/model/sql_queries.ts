
export type SqlQuery<T, P> = {
    readonly type: T;
    readonly data: P;
};

export enum SqlQueryType {
    GET_EVENTS = "GET_EVENTS",
    GET_OPERATOR_FREQUENCY_PER_EVENT = "GET_OPERATOR_FREQUENCY_PER_EVENT",
    GET_REL_OP_DISTR_PER_BUCKET = "GET_REL_OP_DISTR_PER_BUCKET",
    other = "other",
}

export type QueryVariant =
    | SqlQuery<SqlQueryType.GET_EVENTS, {}>
    | SqlQuery<SqlQueryType.GET_OPERATOR_FREQUENCY_PER_EVENT, { event: string }>
    | SqlQuery<SqlQueryType.GET_REL_OP_DISTR_PER_BUCKET, { event: string }>
    | SqlQuery<SqlQueryType.other, {}>
    ;

export function createSqlQuery(query: QueryVariant) {

    switch (query.type) {
        case SqlQueryType.GET_EVENTS:
            return 'select distinct ev_name from yx';
        case SqlQueryType.GET_OPERATOR_FREQUENCY_PER_EVENT:
            return `select operator, count(operator)  from xy where ev_name = '${query.data.event}' group by operator`;
        case SqlQueryType.GET_REL_OP_DISTR_PER_BUCKET:
            return `select range, operator, relFreq(operator) from xy where ev_name = '${query.data.event}' group by range, operator`;
        case SqlQueryType.other:
            return 'error - bad request to backend';
    }
}


