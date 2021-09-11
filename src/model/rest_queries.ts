
export type RestQuery<T, P> = {
    readonly type: T;
    readonly data: P;
};

export enum RestQueryType {
    GET_EVENTS = "GET_EVENTS",
    GET_OPERATOR_FREQUENCY_PER_EVENT = "GET_OPERATOR_FREQUENCY_PER_EVENT",
    GET_REL_OP_DISTR_PER_BUCKET = "GET_REL_OP_DISTR_PER_BUCKET",
    GET_REL_OP_DISTR_PER_BUCKET_PER_PIPELINE = "GET_REL_OP_DISTR_PER_BUCKET_PER_PIPELINE",
    other = "other",
}

export type QueryVariant =
    | RestQuery<RestQueryType.GET_EVENTS, {}>
    | RestQuery<RestQueryType.GET_OPERATOR_FREQUENCY_PER_EVENT, { event: string }>
    | RestQuery<RestQueryType.GET_REL_OP_DISTR_PER_BUCKET, { event: string }>
    | RestQuery<RestQueryType.GET_REL_OP_DISTR_PER_BUCKET_PER_PIPELINE, { event: string }>
    | RestQuery<RestQueryType.other, {}>
    ;

export function createRestQuery(query: QueryVariant) {

    switch (query.type) {
        case RestQueryType.GET_EVENTS:
            return 'ev_name/distinct?ev_name';
        case RestQueryType.GET_OPERATOR_FREQUENCY_PER_EVENT:
            return `operator/count/?ev_name="${query.data.event}"/count?operator`;
        case RestQueryType.GET_REL_OP_DISTR_PER_BUCKET:
            return `range/operator/relfreq/?ev_name="${query.data.event}"/relfreq?operator:0.2`;
        case RestQueryType.GET_REL_OP_DISTR_PER_BUCKET_PER_PIPELINE:
            return `select range, operator, relFreq(operator) from xy where ev_name = '${query.data.event}' group by range, operator, pipeline`;
        case RestQueryType.other:
            return 'error - bad request to backend';
    }
}


