
export type RestQuery<T, P> = {
    readonly type: T;
    readonly data: P;
};

export enum RestQueryType {
    GET_EVENTS = "GET_EVENTS",
    GET_PIPELINES = "GET_PIPELINES",
    GET_OPERATOR_FREQUENCY_PER_EVENT = "GET_OPERATOR_FREQUENCY_PER_EVENT",
    GET_REL_OP_DISTR_PER_BUCKET = "GET_REL_OP_DISTR_PER_BUCKET",
    GET_REL_OP_DISTR_PER_BUCKET_PER_PIPELINE = "GET_REL_OP_DISTR_PER_BUCKET_PER_PIPELINE",
    GET_REL_OP_DISTR_PER_BUCKET_PER_MULTIPLE_PIPELINES = "GET_REL_OP_DISTR_PER_BUCKET_PER_MULTIPLE_PIPELINES",
    GET_PIPELINE_COUNT = "GET_PIPELINE_COUNT",
    other = "other",
}

export type QueryVariant =
    | RestQuery<RestQueryType.GET_EVENTS, {}>
    | RestQuery<RestQueryType.GET_PIPELINES, {}>
    | RestQuery<RestQueryType.GET_OPERATOR_FREQUENCY_PER_EVENT, { event: string }>
    | RestQuery<RestQueryType.GET_REL_OP_DISTR_PER_BUCKET, { event: string, time: string }>
    | RestQuery<RestQueryType.GET_REL_OP_DISTR_PER_BUCKET_PER_PIPELINE, { event: string, time: string }>
    | RestQuery<RestQueryType.GET_REL_OP_DISTR_PER_BUCKET_PER_MULTIPLE_PIPELINES, { event: string, time: string, pipelines: string }>
    | RestQuery<RestQueryType.GET_PIPELINE_COUNT, { event: string} >
    | RestQuery<RestQueryType.other, {}>
    ;

export function createRestQuery(query: QueryVariant) {

    switch (query.type) {
        case RestQueryType.GET_EVENTS:
            return 'ev_name/distinct?ev_name';
        case RestQueryType.GET_PIPELINES:
            return 'pipeline/distinct?pipeline/sort?pipeline';
        case RestQueryType.GET_OPERATOR_FREQUENCY_PER_EVENT:
            return `operator/count/?ev_name="${query.data.event}"/count?operator/sort?operator`;
        case RestQueryType.GET_REL_OP_DISTR_PER_BUCKET:
            return `bucket/operator/relfreq/?ev_name="${query.data.event}"/relfreq?time:${query.data.time}`;
        case RestQueryType.GET_REL_OP_DISTR_PER_BUCKET_PER_PIPELINE:
            return `bucket/operator/relfreq/?ev_name="${query.data.event}"/relfreq?pipeline,time:${query.data.time}`;
        case RestQueryType.GET_REL_OP_DISTR_PER_BUCKET_PER_MULTIPLE_PIPELINES:
            console.log(`bucket/operator/relfreq/?ev_name="${query.data.event}"/relfreq?pipeline,time:${query.data.time}!${query.data.pipelines}`);
            return `bucket/operator/relfreq/?ev_name="${query.data.event}"/relfreq?pipeline,time:${query.data.time}!${query.data.pipelines}`;
        case RestQueryType.GET_PIPELINE_COUNT:
            return `pipeline/count/?ev_name="${query.data.event}"/count?pipeline/sort?pipeline`;
        case RestQueryType.other:
            return 'error - bad request to backend';
    }
}


