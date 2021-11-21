
export type BackendQuery<T, P> = {
    readonly type: T;
    readonly data: P;
};

export enum BackendQueryType {
    GET_EVENTS = "GET_EVENTS",
    GET_PIPELINES = "GET_PIPELINES",
    GET_OPERATORS = "GET_OPERATORS",
    GET_STATISTICS = "GET_STATISTICS",
    GET_OPERATOR_FREQUENCY_PER_EVENT = "GET_OPERATOR_FREQUENCY_PER_EVENT",
    // GET_REL_OP_DISTR_PER_BUCKET = "GET_REL_OP_DISTR_PER_BUCKET",
    // GET_REL_OP_DISTR_PER_BUCKET_PER_PIPELINE = "GET_REL_OP_DISTR_PER_BUCKET_PER_PIPELINE",
    GET_REL_OP_DISTR_PER_BUCKET_PER_MULTIPLE_PIPELINES = "GET_REL_OP_DISTR_PER_BUCKET_PER_MULTIPLE_PIPELINES",
    GET_ABS_OP_DISTR_PER_BUCKET_PER_MULTIPLE_PIPELINES = "GET_ABS_OP_DISTR_PER_BUCKET_PER_MULTIPLE_PIPELINES",
    GET_REL_OP_DISTR_PER_BUCKET_PER_MULTIPLE_PIPELINES_COMBINED_EVENTS = "GET_REL_OP_DISTR_PER_BUCKET_PER_MULTIPLE_PIPELINES_COMBINED_EVENTS",
    GET_ABS_OP_DISTR_PER_BUCKET_PER_MULTIPLE_PIPELINES_COMBINED_EVENTS = "GET_ABS_OP_DISTR_PER_BUCKET_PER_MULTIPLE_PIPELINES_COMBINED_EVENTS",
    // GET_PIPELINE_COUNT = "GET_PIPELINE_COUNT",
    GET_EVENT_OCCURRENCES_PER_TIME_UNIT = "GET_EVENT_OCCURRENCES_PER_TIME_UNIT",
    GET_PIPELINE_COUNT_WITH_OPERATOR_OCCURENCES = "GET_PIPELINE_COUNT_WITH_OPERATOR_OCCURENCES",
    GET_MEMORY_ACCESSES_PER_TIME_BUCKET_PER_EVENT = "GET_MEMORY_ACCESSES_PER_TIME_BUCKET_PER_EVENT",
    GET_GROUPED_UIR_LINES = "GET_GROUPED_UIR_LINES",
    other = "other",
}

export type QueryVariant =
    | BackendQuery<BackendQueryType.GET_EVENTS, {}>
    | BackendQuery<BackendQueryType.GET_PIPELINES, {}>
    | BackendQuery<BackendQueryType.GET_OPERATORS, { event: string }>
    | BackendQuery<BackendQueryType.GET_STATISTICS, { event: string, pipelines: Array<string> | "All", timeBucketFrame: [number, number] }>
    | BackendQuery<BackendQueryType.GET_OPERATOR_FREQUENCY_PER_EVENT, { event: string, pipelines: Array<string> | "All", timeBucketFrame: [number, number] }>
    // | RestQuery<RestQueryType.GET_REL_OP_DISTR_PER_BUCKET, { event: string, bucketSize: number }>
    // | RestQuery<RestQueryType.GET_REL_OP_DISTR_PER_BUCKET_PER_PIPELINE, { event: string, bucketSize: number }>
    | BackendQuery<BackendQueryType.GET_REL_OP_DISTR_PER_BUCKET_PER_MULTIPLE_PIPELINES, { event: string, bucketSize: number, pipelines: Array<string> | "All", operators: Array<string> | "All", timeBucketFrame: [number, number] }>
    | BackendQuery<BackendQueryType.GET_ABS_OP_DISTR_PER_BUCKET_PER_MULTIPLE_PIPELINES, { event: string, bucketSize: number, pipelines: Array<string> | "All", operators: Array<string> | "All", timeBucketFrame: [number, number] }>
    | BackendQuery<BackendQueryType.GET_REL_OP_DISTR_PER_BUCKET_PER_MULTIPLE_PIPELINES_COMBINED_EVENTS, { event1: string, event0: string, bucketSize: number, pipelines: Array<string> | "All", operators: Array<string> | "All", timeBucketFrame: [number, number] }>
    | BackendQuery<BackendQueryType.GET_ABS_OP_DISTR_PER_BUCKET_PER_MULTIPLE_PIPELINES_COMBINED_EVENTS, { event1: string, event0: string, bucketSize: number, pipelines: Array<string> | "All", operators: Array<string> | "All", timeBucketFrame: [number, number] }>
    // | RestQuery<RestQueryType.GET_PIPELINE_COUNT, { event: string, timeBucketFrame: [number, number] }>
    | BackendQuery<BackendQueryType.GET_EVENT_OCCURRENCES_PER_TIME_UNIT, { event: string, bucketSize: number }>
    | BackendQuery<BackendQueryType.GET_PIPELINE_COUNT_WITH_OPERATOR_OCCURENCES, { event: string, timeBucketFrame: [number, number], allPipelines: Array<string> }>
    | BackendQuery<BackendQueryType.GET_MEMORY_ACCESSES_PER_TIME_BUCKET_PER_EVENT, { event: string, bucketSize: number, timeBucketFrame: [number, number], showMemoryAccessesDifferences: boolean }>
    | BackendQuery<BackendQueryType.GET_GROUPED_UIR_LINES, { timeBucketFrame: [number, number] }>
    | BackendQuery<BackendQueryType.other, {}>
    ;

export function createBackendQuery(query: QueryVariant) {

    const bucketSize = (query.data as any).bucketSize ? `time:${(query.data as any).bucketSize}` : '';

    const event = (query.data as any).event ? ((query.data as any).event === "Default" ? 'Default' : (query.data as any).event) : '';
    const eventFilter = event && `/?ev_name="${event}"`;

    const time = (query.data as any).timeBucketFrame ? `${(query.data as any).timeBucketFrame[0]}from_to${(query.data as any).timeBucketFrame[1]}` : '';
    const timeFilter = time && `/?time="${time}"`;

    const pipelines = (query.data as any).pipelines && (query.data as any).pipelines.length > 0 ? ((query.data as any).pipelines === "All" ? 'All' : (query.data as any).pipelines.join()) : ' ';
    const pipelinesFilter = pipelines && `/?pipeline="${pipelines}"`;

    const operators = (query.data as any).operators && (query.data as any).operators.length > 0 ? ((query.data as any).operators === "All" ? 'All' : (query.data as any).operators.join()) : ' ';
    const operatorsFilter = operators && `/?operator="${operators}"`;

    const memoryAccessesDifferences = (query.data as any).showMemoryAccessesDifferences ? '#DIFF' : '#ABS';

    switch (query.type) {
        case BackendQueryType.GET_EVENTS:
            return 'ev_name/distinct?ev_name/sort?ev_name';
        case BackendQueryType.GET_PIPELINES:
            return 'pipeline/count?pipeline/sort?count';
        case BackendQueryType.GET_OPERATORS:
            return `operator${eventFilter}/count?operator/sort?count,desc`;
        case BackendQueryType.GET_STATISTICS:
            return `count${timeFilter}${pipelinesFilter}${eventFilter}/basic_count?operator&&count${timeFilter}${pipelinesFilter}${eventFilter}/count(distinct)?pipeline&&count${timeFilter}${pipelinesFilter}${eventFilter}/count(distinct)?operator&&count${timeFilter}${pipelinesFilter}${eventFilter}/max(time)?time&&count${timeFilter}${pipelinesFilter}${eventFilter}/relative?operator`;
        case BackendQueryType.GET_OPERATOR_FREQUENCY_PER_EVENT:
            return `operator/count${eventFilter}${pipelinesFilter}${timeFilter}/count?operator/sort?operator`;
        // case RestQueryType.GET_REL_OP_DISTR_PER_BUCKET:
        //     return `bucket/operator/relfreq${eventFilter}/relfreq?${bucketSize}`;
        // case RestQueryType.GET_REL_OP_DISTR_PER_BUCKET_PER_PIPELINE:
        //     return `bucket/operator/relfreq${eventFilter}/relfreq?pipeline,${bucketSize}`;
        case BackendQueryType.GET_REL_OP_DISTR_PER_BUCKET_PER_MULTIPLE_PIPELINES:
            return `bucket/operator/relfreq${eventFilter}${timeFilter}/relfreq?pipeline,${bucketSize}!${pipelines}!${operators}!${time}`;
        case BackendQueryType.GET_ABS_OP_DISTR_PER_BUCKET_PER_MULTIPLE_PIPELINES:
            return `bucket/operator/absfreq${eventFilter}${timeFilter}/absfreq?pipeline,${bucketSize}!${pipelines}!${operators}!${time}`;
        case BackendQueryType.GET_REL_OP_DISTR_PER_BUCKET_PER_MULTIPLE_PIPELINES_COMBINED_EVENTS:
            return `bucket/operator/relfreq/bucketNEG/operatorNEG/relfreqNEG${timeFilter}/relfreq?pipeline,${bucketSize}!${pipelines}&${query.data.event1},${query.data.event0}&${operators}&${time}`;
        case BackendQueryType.GET_ABS_OP_DISTR_PER_BUCKET_PER_MULTIPLE_PIPELINES_COMBINED_EVENTS:
            return `bucket/operator/absfreq/bucketNEG/operatorNEG/absfreqNEG${timeFilter}/absfreq?pipeline,${bucketSize}!${pipelines}&${query.data.event1},${query.data.event0}&${operators}&${time}`;
        // case RestQueryType.GET_PIPELINE_COUNT:
        //     return `pipeline/count${eventFilter}${timeFilter}/count?pipeline/sort?pipeline`;
        case BackendQueryType.GET_EVENT_OCCURRENCES_PER_TIME_UNIT:
            return `bucket/absfreq${eventFilter}/absfreq?ev_name,${bucketSize}`;
        case BackendQueryType.GET_PIPELINE_COUNT_WITH_OPERATOR_OCCURENCES:
            return `pipeline/operator/opcount/pipecount${eventFilter}${timeFilter}/sunburst?pipeline`;
        case BackendQueryType.GET_MEMORY_ACCESSES_PER_TIME_BUCKET_PER_EVENT:
            return `bucket/operator/mem/freq${eventFilter}${timeFilter}/heatmap?${bucketSize}!${time}${memoryAccessesDifferences}`;
        case BackendQueryType.GET_GROUPED_UIR_LINES:
            return `scrline/perc1/perc2/perc3/perc4/op/pipe${timeFilter}/uir?srclines`;
        case BackendQueryType.other:
            return 'error - bad request to backend';
    }
}

