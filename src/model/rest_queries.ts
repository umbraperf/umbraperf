
export type RestQuery<T, P> = {
    readonly type: T;
    readonly data: P;
};

export enum RestQueryType {
    GET_EVENTS = "GET_EVENTS",
    GET_PIPELINES = "GET_PIPELINES",
    GET_OPERATORS = "GET_OPERATORS",
    GET_STATISTICS = "GET_STATISTICS",
    GET_OPERATOR_FREQUENCY_PER_EVENT = "GET_OPERATOR_FREQUENCY_PER_EVENT",
    GET_REL_OP_DISTR_PER_BUCKET = "GET_REL_OP_DISTR_PER_BUCKET",
    GET_REL_OP_DISTR_PER_BUCKET_PER_PIPELINE = "GET_REL_OP_DISTR_PER_BUCKET_PER_PIPELINE",
    GET_REL_OP_DISTR_PER_BUCKET_PER_MULTIPLE_PIPELINES = "GET_REL_OP_DISTR_PER_BUCKET_PER_MULTIPLE_PIPELINES",
    GET_ABS_OP_DISTR_PER_BUCKET_PER_MULTIPLE_PIPELINES = "GET_ABS_OP_DISTR_PER_BUCKET_PER_MULTIPLE_PIPELINES",
    GET_REL_OP_DISTR_PER_BUCKET_PER_MULTIPLE_PIPELINES_COMBINED_EVENTS = "GET_REL_OP_DISTR_PER_BUCKET_PER_MULTIPLE_PIPELINES_COMBINED_EVENTS",
    GET_ABS_OP_DISTR_PER_BUCKET_PER_MULTIPLE_PIPELINES_COMBINED_EVENTS = "GET_ABS_OP_DISTR_PER_BUCKET_PER_MULTIPLE_PIPELINES_COMBINED_EVENTS",
    GET_PIPELINE_COUNT = "GET_PIPELINE_COUNT",
    GET_EVENT_OCCURRENCES_PER_TIME_UNIT = "GET_EVENT_OCCURRENCES_PER_TIME_UNIT",
    GET_PIPELINE_COUNT_WITH_OPERATOR_OCCURENCES = "GET_PIPELINE_COUNT_WITH_OPERATOR_OCCURENCES",
    other = "other",
}

export type QueryVariant =
    | RestQuery<RestQueryType.GET_EVENTS, {}>
    | RestQuery<RestQueryType.GET_PIPELINES, {}>
    | RestQuery<RestQueryType.GET_OPERATORS, { event: string }>
    | RestQuery<RestQueryType.GET_STATISTICS, { event: string, pipelines: Array<string> | "All", timeBucketFrame: [number, number] }>
    | RestQuery<RestQueryType.GET_OPERATOR_FREQUENCY_PER_EVENT, { event: string, pipelines: Array<string> | "All", timeBucketFrame: [number, number] }>
    | RestQuery<RestQueryType.GET_REL_OP_DISTR_PER_BUCKET, { event: string, bucketSize: number }>
    | RestQuery<RestQueryType.GET_REL_OP_DISTR_PER_BUCKET_PER_PIPELINE, { event: string, bucketSize: number }>
    | RestQuery<RestQueryType.GET_REL_OP_DISTR_PER_BUCKET_PER_MULTIPLE_PIPELINES, { event: string, bucketSize: number, pipelines: Array<string> | "All", operators: Array<string> | "All", timeBucketFrame: [number, number] }>
    | RestQuery<RestQueryType.GET_ABS_OP_DISTR_PER_BUCKET_PER_MULTIPLE_PIPELINES, { event: string, bucketSize: number, pipelines: Array<string> | "All", operators: Array<string> | "All", timeBucketFrame: [number, number] }>
    | RestQuery<RestQueryType.GET_REL_OP_DISTR_PER_BUCKET_PER_MULTIPLE_PIPELINES_COMBINED_EVENTS, { event1: string, event2: string, bucketSize: number, pipelines: Array<string> | "All", timeBucketFrame: [number, number] }>
    | RestQuery<RestQueryType.GET_ABS_OP_DISTR_PER_BUCKET_PER_MULTIPLE_PIPELINES_COMBINED_EVENTS, { event1: string, event2: string, bucketSize: number, pipelines: Array<string> | "All", timeBucketFrame: [number, number] }>
    | RestQuery<RestQueryType.GET_PIPELINE_COUNT, { event: string, timeBucketFrame: [number, number] }>
    | RestQuery<RestQueryType.GET_EVENT_OCCURRENCES_PER_TIME_UNIT, { event: string, bucketSize: number }>
    | RestQuery<RestQueryType.GET_PIPELINE_COUNT_WITH_OPERATOR_OCCURENCES, { event: string, timeBucketFrame: [number, number], allPipelines: Array<string> }>
    | RestQuery<RestQueryType.other, {}>
    ;

export function createRestQuery(query: QueryVariant) {

    const bucketSize = (query.data as any).bucketSize ? `time:${(query.data as any).bucketSize}` : '';

    const event = (query.data as any).event ? ((query.data as any).event === "Default" ? 'Default' : (query.data as any).event) : '';
    const eventFilter = event && `/?ev_name="${event}"`;

    const time = (query.data as any).timeBucketFrame ? `${(query.data as any).timeBucketFrame[0]}to${(query.data as any).timeBucketFrame[1]}` : '';
    const timeFilter = time && `/?time="${time}"`;

    const pipelines = (query.data as any).pipelines ? ((query.data as any).pipelines === "All" ? 'All' : (query.data as any).pipelines.join()) : '';
    const pipelinesFilter = pipelines && `/?pipeline="${pipelines}"`;

    const operators = (query.data as any).operators ? ((query.data as any).operators === "All" ? 'All' : (query.data as any).operators.join()) : '';
    const operatorsFilter = operators && `/?operator="${operators}"`;

    switch (query.type) {
        case RestQueryType.GET_EVENTS:
            return 'ev_name/distinct?ev_name/sort?ev_name';
        case RestQueryType.GET_PIPELINES:
            return 'pipeline/count?pipeline/sort?count'
        case RestQueryType.GET_OPERATORS:
            return `operator${eventFilter}/count?operator/sort?count,desc`
        case RestQueryType.GET_STATISTICS:
            return `count${timeFilter}${pipelinesFilter}${eventFilter}/basic_count?operator&&count${timeFilter}${pipelinesFilter}${eventFilter}/count(distinct)?pipeline&&count${timeFilter}${pipelinesFilter}${eventFilter}/count(distinct)?operator&&count${timeFilter}${pipelinesFilter}${eventFilter}/max(time)?time&&count${timeFilter}${pipelinesFilter}${eventFilter}/relative?operator`;
        case RestQueryType.GET_OPERATOR_FREQUENCY_PER_EVENT:
            return `operator/count${eventFilter}${pipelinesFilter}${timeFilter}/count?operator/sort?operator`;
        case RestQueryType.GET_REL_OP_DISTR_PER_BUCKET:
            return `bucket/operator/relfreq${eventFilter}/relfreq?${bucketSize}`;
        case RestQueryType.GET_REL_OP_DISTR_PER_BUCKET_PER_PIPELINE:
            return `bucket/operator/relfreq${eventFilter}/relfreq?pipeline,${bucketSize}`;
        case RestQueryType.GET_REL_OP_DISTR_PER_BUCKET_PER_MULTIPLE_PIPELINES:
            return `bucket/operator/relfreq${eventFilter}${timeFilter}/relfreq?pipeline,${bucketSize}!${pipelines}!${operators}`;
        case RestQueryType.GET_ABS_OP_DISTR_PER_BUCKET_PER_MULTIPLE_PIPELINES:
            return `bucket/operator/absfreq${eventFilter}${timeFilter}/absfreq?pipeline,${bucketSize}!${pipelines}!${operators}`;
        case RestQueryType.GET_REL_OP_DISTR_PER_BUCKET_PER_MULTIPLE_PIPELINES_COMBINED_EVENTS:
            return `bucket/operator/relfreq/bucketNEG/operatorNEG/relfreqNEG${timeFilter}/relfreq?pipeline,${bucketSize}!${pipelines}&${query.data.event1},${query.data.event2}`;
        case RestQueryType.GET_ABS_OP_DISTR_PER_BUCKET_PER_MULTIPLE_PIPELINES_COMBINED_EVENTS:
            return `bucket/operator/absfreq/bucketNEG/operatorNEG/absfreqNEG${timeFilter}/absfreq?pipeline,${bucketSize}!${pipelines}&${query.data.event1},${query.data.event2}`;
        case RestQueryType.GET_PIPELINE_COUNT:
            return `pipeline/count${eventFilter}${timeFilter}/count?pipeline/sort?pipeline`;
        case RestQueryType.GET_EVENT_OCCURRENCES_PER_TIME_UNIT:
            return `bucket/absfreq${eventFilter}/absfreq?ev_name,${bucketSize}`;
        case RestQueryType.GET_PIPELINE_COUNT_WITH_OPERATOR_OCCURENCES:
            const queryInnerCircle: string = `parent/pipeline/pipeOccurrences/occurrences${eventFilter}${timeFilter}/count?pipeline/sort?pipeline/add_column?"inner",parent/rename?count,pipeOccurrences/add_column?0.0,occurrences`;
            const queryOuterCircles: Array<string> = (((query.data as any).allPipelines) as Array<string>).map(elem => (`%%parent/operator/pipeOccurrences/occurrences${eventFilter}${timeFilter}/?pipeline="${elem}"/count?operator/sort?operator/add_column?"${elem}",parent/add_column?0.0,pipeOccurrences/rename?count,occurrences`));
            const completeQuery: string = queryInnerCircle + queryOuterCircles.join("");
            return completeQuery;
        case RestQueryType.other:
            return 'error - bad request to backend';
    }
}


