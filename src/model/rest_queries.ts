
export type RestQuery<T, P> = {
    readonly type: T;
    readonly data: P;
};

export enum RestQueryType {
    GET_EVENTS = "GET_EVENTS",
    GET_PIPELINES = "GET_PIPELINES",
    GET_STATISTICS = "GET_STATISTICS",
    GET_OPERATOR_FREQUENCY_PER_EVENT = "GET_OPERATOR_FREQUENCY_PER_EVENT",
    GET_REL_OP_DISTR_PER_BUCKET = "GET_REL_OP_DISTR_PER_BUCKET",
    GET_REL_OP_DISTR_PER_BUCKET_PER_PIPELINE = "GET_REL_OP_DISTR_PER_BUCKET_PER_PIPELINE",
    GET_REL_OP_DISTR_PER_BUCKET_PER_MULTIPLE_PIPELINES = "GET_REL_OP_DISTR_PER_BUCKET_PER_MULTIPLE_PIPELINES",
    GET_ABS_OP_DISTR_PER_BUCKET_PER_MULTIPLE_PIPELINES = "GET_ABS_OP_DISTR_PER_BUCKET_PER_MULTIPLE_PIPELINES",
    GET_REL_OP_DISTR_PER_BUCKET_PER_MULTIPLE_PIPELINES_COMBINED_EVENTS = "GET_REL_OP_DISTR_PER_BUCKET_PER_MULTIPLE_PIPELINES_COMBINED_EVENTS",
    GET_PIPELINE_COUNT = "GET_PIPELINE_COUNT",
    GET_EVENT_OCCURRENCES_PER_TIME_UNIT = "GET_EVENT_OCCURRENCES_PER_TIME_UNIT",
    other = "other",
}

export type QueryVariant =
    | RestQuery<RestQueryType.GET_EVENTS, {}>
    | RestQuery<RestQueryType.GET_PIPELINES, {}>
    | RestQuery<RestQueryType.GET_STATISTICS, {}>
    | RestQuery<RestQueryType.GET_OPERATOR_FREQUENCY_PER_EVENT, { event: string, pipelines: string, timeBucketFrame: [number, number] }>
    | RestQuery<RestQueryType.GET_REL_OP_DISTR_PER_BUCKET, { event: string, time: string }>
    | RestQuery<RestQueryType.GET_REL_OP_DISTR_PER_BUCKET_PER_PIPELINE, { event: string, time: string }>
    | RestQuery<RestQueryType.GET_REL_OP_DISTR_PER_BUCKET_PER_MULTIPLE_PIPELINES, { event: string, time: string, pipelines: string, timeBucketFrame: [number, number] }>
    | RestQuery<RestQueryType.GET_ABS_OP_DISTR_PER_BUCKET_PER_MULTIPLE_PIPELINES, { event: string, time: string, pipelines: string, timeBucketFrame: [number, number] }>
    | RestQuery<RestQueryType.GET_REL_OP_DISTR_PER_BUCKET_PER_MULTIPLE_PIPELINES_COMBINED_EVENTS, { event1: string, event2: string, time: string, pipelines: string, timeBucketFrame: [number, number] }>
    | RestQuery<RestQueryType.GET_PIPELINE_COUNT, { event: string, timeBucketFrame: [number, number] }>
    | RestQuery<RestQueryType.GET_EVENT_OCCURRENCES_PER_TIME_UNIT, { event: string, time: string }>
    | RestQuery<RestQueryType.other, {}>
    ;

export function createRestQuery(query: QueryVariant) {

    const timeFilter = ((query.data as any).timeBucketFrame !== undefined && (query.data as any).timeBucketFrame.length > 0 && (query.data as any).timeBucketFrame[0] !== -1)
        ? `/?time="${(query.data as any).timeBucketFrame[0]}to${(query.data as any).timeBucketFrame[1]}"`
        : "";

    switch (query.type) {
        case RestQueryType.GET_EVENTS:
            return 'ev_name/distinct?ev_name/sort?ev_name';
        case RestQueryType.GET_PIPELINES:
            return 'pipeline/distinct?pipeline/sort?pipeline';
        case RestQueryType.GET_STATISTICS:
            return 'count/?pipeline=""/?ev_name=""/basic_count?operator&&count/?pipeline=""/?ev_name=""/count(distinct)?pipeline&&count/?pipeline=""/?ev_name=""/count(distinct)?operator&&count/?pipeline=""/?ev_name=""/max?time&&count/?pipeline=""/?ev_name=""/relative?operator';
        case RestQueryType.GET_OPERATOR_FREQUENCY_PER_EVENT:
            return `operator/count/?ev_name="${query.data.event}"/?pipeline="${query.data.pipelines}"${timeFilter}/count?operator/sort?operator`;
        case RestQueryType.GET_REL_OP_DISTR_PER_BUCKET:
            return `bucket/operator/relfreq/?ev_name="${query.data.event}"/relfreq?time:${query.data.time}`;
        case RestQueryType.GET_REL_OP_DISTR_PER_BUCKET_PER_PIPELINE:
            return `bucket/operator/relfreq/?ev_name="${query.data.event}"/relfreq?pipeline,time:${query.data.time}`;
        case RestQueryType.GET_REL_OP_DISTR_PER_BUCKET_PER_MULTIPLE_PIPELINES:
            return `bucket/operator/relfreq/?ev_name="${query.data.event}"${timeFilter}/relfreq?pipeline,time:${query.data.time}!${query.data.pipelines}`;
        case RestQueryType.GET_ABS_OP_DISTR_PER_BUCKET_PER_MULTIPLE_PIPELINES:
            return `bucket/operator/absfreq/?ev_name="${query.data.event}"${timeFilter}/absfreq?pipeline,time:${query.data.time}!${query.data.pipelines}`;
        case RestQueryType.GET_REL_OP_DISTR_PER_BUCKET_PER_MULTIPLE_PIPELINES_COMBINED_EVENTS:
            return `bucket/operator/relfreq/bucketNEG/operatorNEG/relfreqNEG${timeFilter}/relfreq?pipeline,time:${query.data.time}!${query.data.pipelines}&${query.data.event1},${query.data.event2}`;
        case RestQueryType.GET_PIPELINE_COUNT:
            return `pipeline/count/?ev_name="${query.data.event}"${timeFilter}/count?pipeline/sort?pipeline`;
        case RestQueryType.GET_EVENT_OCCURRENCES_PER_TIME_UNIT:
            return `bucket/absfreq/?ev_name="${query.data.event}"/absfreq?ev_name,time:${query.data.time}`;
        case RestQueryType.other:
            return 'error - bad request to backend';
    }
}


