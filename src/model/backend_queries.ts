import { HeatmapsOutlierDetectionDegrees } from ".";

export type BackendQuery<T, P> = {
    readonly type: T;
    readonly data: P;
};

export enum BackendQueryType {
    GET_EVENTS = "GET_EVENTS",
    GET_PIPELINES = "GET_PIPELINES",
    GET_OPERATORS = "GET_OPERATORS",
    GET_STATISTICS = "GET_STATISTICS",
    GET_PIPELINES_ACTIVE_IN_TIMEFRAME_PER_EVENT = "GET_PIPELINES_ACTIVE_IN_TIMEFRAME_PER_EVENT",
    GET_OPERATORS_ACTIVE_IN_TIMEFRAME_PIPELINE_PER_EVENT = "GET_OPERATORS_ACTIVE_IN_TIMEFRAME_PIPELINE_PER_EVENT",
    GET_OPERATOR_FREQUENCY_PER_EVENT = "GET_OPERATOR_FREQUENCY_PER_EVENT",
    GET_REL_OP_DISTR_PER_BUCKET_PER_MULTIPLE_PIPELINES = "GET_REL_OP_DISTR_PER_BUCKET_PER_MULTIPLE_PIPELINES",
    GET_ABS_OP_DISTR_PER_BUCKET_PER_MULTIPLE_PIPELINES = "GET_ABS_OP_DISTR_PER_BUCKET_PER_MULTIPLE_PIPELINES",
    GET_REL_OP_DISTR_PER_BUCKET_PER_MULTIPLE_PIPELINES_COMBINED_EVENTS = "GET_REL_OP_DISTR_PER_BUCKET_PER_MULTIPLE_PIPELINES_COMBINED_EVENTS",
    GET_ABS_OP_DISTR_PER_BUCKET_PER_MULTIPLE_PIPELINES_COMBINED_EVENTS = "GET_ABS_OP_DISTR_PER_BUCKET_PER_MULTIPLE_PIPELINES_COMBINED_EVENTS",
    GET_EVENT_OCCURRENCES_PER_TIME_UNIT = "GET_EVENT_OCCURRENCES_PER_TIME_UNIT",
    GET_PIPELINE_COUNT_WITH_OPERATOR_OCCURENCES = "GET_PIPELINE_COUNT_WITH_OPERATOR_OCCURENCES",
    GET_MEMORY_ACCESSES_PER_TIME_BUCKET_PER_EVENT = "GET_MEMORY_ACCESSES_PER_TIME_BUCKET_PER_EVENT",
    GET_GROUPED_UIR_LINES = "GET_GROUPED_UIR_LINES",
    GET_QUERYPLAN_TOOLTIP_DATA = "GET_QUERYPLAN_TOOLTIP_DATA",
    other = "other",
}

export type QueryVariant =
    | BackendQuery<BackendQueryType.GET_EVENTS, {}>
    | BackendQuery<BackendQueryType.GET_PIPELINES, {}>
    | BackendQuery<BackendQueryType.GET_OPERATORS, { event: string }>
    | BackendQuery<BackendQueryType.GET_STATISTICS, { event: string, pipelines: Array<string> | "All", timeBucketFrame: [number, number] }>
    | BackendQuery<BackendQueryType.GET_PIPELINES_ACTIVE_IN_TIMEFRAME_PER_EVENT, { event: string, timeBucketFrame: [number, number] }>
    | BackendQuery<BackendQueryType.GET_OPERATORS_ACTIVE_IN_TIMEFRAME_PIPELINE_PER_EVENT, { event: string, timeBucketFrame: [number, number], pipelines: Array<string> | "All" }>
    | BackendQuery<BackendQueryType.GET_OPERATOR_FREQUENCY_PER_EVENT, { event: string, pipelines: Array<string> | "All", timeBucketFrame: [number, number] }>
    | BackendQuery<BackendQueryType.GET_REL_OP_DISTR_PER_BUCKET_PER_MULTIPLE_PIPELINES, { event: string, bucketSize: number, pipelines: Array<string> | "All", operators: Array<string> | "All", timeBucketFrame: [number, number] }>
    | BackendQuery<BackendQueryType.GET_ABS_OP_DISTR_PER_BUCKET_PER_MULTIPLE_PIPELINES, { event: string, bucketSize: number, pipelines: Array<string> | "All", operators: Array<string> | "All", timeBucketFrame: [number, number] }>
    | BackendQuery<BackendQueryType.GET_REL_OP_DISTR_PER_BUCKET_PER_MULTIPLE_PIPELINES_COMBINED_EVENTS, { event2: string, event1: string, bucketSize: number, pipelines: Array<string> | "All", operators: Array<string> | "All", timeBucketFrame: [number, number] }>
    | BackendQuery<BackendQueryType.GET_ABS_OP_DISTR_PER_BUCKET_PER_MULTIPLE_PIPELINES_COMBINED_EVENTS, { event2: string, event1: string, bucketSize: number, pipelines: Array<string> | "All", operators: Array<string> | "All", timeBucketFrame: [number, number] }>
    | BackendQuery<BackendQueryType.GET_EVENT_OCCURRENCES_PER_TIME_UNIT, { event: string, bucketSize: number }>
    | BackendQuery<BackendQueryType.GET_PIPELINE_COUNT_WITH_OPERATOR_OCCURENCES, { event: string, timeBucketFrame: [number, number], allPipelines: Array<string> }>
    | BackendQuery<BackendQueryType.GET_MEMORY_ACCESSES_PER_TIME_BUCKET_PER_EVENT, { event: string, bucketSize: number, timeBucketFrame: [number, number], showMemoryAccessesDifferences: boolean, outlierDetectionDegree: HeatmapsOutlierDetectionDegrees }>
    | BackendQuery<BackendQueryType.GET_GROUPED_UIR_LINES, { events: Array<string>, timeBucketFrame: [number, number] }>
    | BackendQuery<BackendQueryType.GET_QUERYPLAN_TOOLTIP_DATA, { event: string, pipelines: Array<string> | "All", timeBucketFrame: [number, number] }>
    | BackendQuery<BackendQueryType.other, {}>
    ;

export function createBackendQuery(query: QueryVariant) {

    const bucketSize = () => {
        return `time:${(query.data as any).bucketSize}`;
    }

    const event = () => {
        return (query.data as any).event;
    }
    const eventFilter = () => {
        const eventString = event();
        return eventString && `/?ev_name="${eventString}"`;
    }

    const doubleEvent = () => {
        return { event1: (query.data as any).event1, event2: (query.data as any).event2 };
    }

    const time = () => {
        return `${(query.data as any).timeBucketFrame[0]}from_to${(query.data as any).timeBucketFrame[1]}`;
    }
    const timeFilter = () => {
        const timeString = time();
        return timeString && `/?time="${timeString}"`;
    }

    const pipelines = () => {
        return (query.data as any).pipelines === "All" ? 'All' : (query.data as any).pipelines.join();
    }
    const pipelinesFilter = () => {
        const pipelinesString = pipelines();
        return pipelinesString && `/?pipeline="${pipelinesString}"`;
    }

    const operators = () => {
        return (query.data as any).operators === "All" ? 'All' : (query.data as any).operators.join();
    }

    const memoryAccessesDifferences = () => {
        return (query.data as any).showMemoryAccessesDifferences ? '#DIFF' : '#ABS';
    }

    const uirLinesEventFrequencySelections = () => {
        let selection = "";
        (query.data as any).events.forEach((elem: string, index: number) => {
            selection += "/perc" + (index + 1);
        });
        return selection;
    }
    const uirLinesEventRelativeFrequencySelections = () => {
        let relSelection = "";
        (query.data as any).events.forEach((elem: string, index: number) => {
            relSelection += "/rel_perc" + (index + 1);
        });
        return relSelection;
    }

    const outlierDetectionDegree = () => {
        return `${(query.data as any).outlierDetectionDegree}`;
    }


    switch (query.type) {
        case BackendQueryType.GET_EVENTS:
            return 'ev_name/distinct?ev_name/sort?ev_name';
        case BackendQueryType.GET_PIPELINES:
            return 'pipeline/count?pipeline/sort?count';
        case BackendQueryType.GET_OPERATORS:
            return 'operator/op_ext/physical_op/count_with_mapping?operator/sort?count,desc';
        case BackendQueryType.GET_STATISTICS:
            return `count${eventFilter()}${pipelinesFilter()}${timeFilter()}/basic_count?operator&&count${eventFilter()}${pipelinesFilter()}${timeFilter()}/count(distinct)?pipeline&&count${eventFilter()}${pipelinesFilter()}${timeFilter()}/count(distinct)?operator&&count${eventFilter()}${pipelinesFilter()}${timeFilter()}/max(time)?time&&count${eventFilter()}${pipelinesFilter()}${timeFilter()}/relative?operator`;
        case BackendQueryType.GET_PIPELINES_ACTIVE_IN_TIMEFRAME_PER_EVENT:
            return `pipeline${eventFilter()}${timeFilter()}/distinct?pipeline`;
        case BackendQueryType.GET_OPERATORS_ACTIVE_IN_TIMEFRAME_PIPELINE_PER_EVENT:
            return `operator${eventFilter()}${pipelinesFilter()}${timeFilter()}/distinct?operator`;
        case BackendQueryType.GET_OPERATOR_FREQUENCY_PER_EVENT:
            return `operator/count${eventFilter()}${pipelinesFilter()}${timeFilter()}/count?operator/sort?operator`;
        case BackendQueryType.GET_REL_OP_DISTR_PER_BUCKET_PER_MULTIPLE_PIPELINES:
            return `bucket/op_ext/operator/relfreq${eventFilter()}${timeFilter()}/relfreq?pipeline,${bucketSize()}!${pipelines()}!${operators()}!${time()}`;
        case BackendQueryType.GET_ABS_OP_DISTR_PER_BUCKET_PER_MULTIPLE_PIPELINES:
            return `bucket/op_ext/operator/absfreq${eventFilter()}${timeFilter()}/absfreq?pipeline,${bucketSize()}!${pipelines()}!${operators()}!${time()}`;
        case BackendQueryType.GET_REL_OP_DISTR_PER_BUCKET_PER_MULTIPLE_PIPELINES_COMBINED_EVENTS:
            return `bucket/op_ext/operator/relfreq/bucketNEG/op_extNEG/operatorNEG/relfreqNEG${timeFilter()}/relfreq?pipeline,${bucketSize()}!${pipelines()}&${doubleEvent().event2},${doubleEvent().event1}&${operators()}&${time()}`;
        case BackendQueryType.GET_ABS_OP_DISTR_PER_BUCKET_PER_MULTIPLE_PIPELINES_COMBINED_EVENTS:
            return `bucket/op_ext/operator/absfreq/bucketNEG/op_extNEG/operatorNEG/absfreqNEG${timeFilter()}/absfreq?pipeline,${bucketSize()}!${pipelines()}&${doubleEvent().event2},${doubleEvent().event1}&${operators()}&${time()}`;
        case BackendQueryType.GET_EVENT_OCCURRENCES_PER_TIME_UNIT:
            return `bucket/absfreq${eventFilter()}/absfreq?ev_name,${bucketSize()}`;
        case BackendQueryType.GET_PIPELINE_COUNT_WITH_OPERATOR_OCCURENCES:
            return `pipeline/operator/opcount/pipecount${eventFilter()}${timeFilter()}/sunburst?pipeline`;
        case BackendQueryType.GET_MEMORY_ACCESSES_PER_TIME_BUCKET_PER_EVENT:
            return `bucket/operator/mem/freq${eventFilter()}${timeFilter()}/heatmap?${bucketSize()}!${time()},${outlierDetectionDegree()}${memoryAccessesDifferences()}`;
        case BackendQueryType.GET_GROUPED_UIR_LINES:
            return `scrline${uirLinesEventFrequencySelections()}/op/pipe/func_flag${uirLinesEventRelativeFrequencySelections()}${timeFilter()}/uir?srclines`;
        case BackendQueryType.GET_QUERYPLAN_TOOLTIP_DATA:
            return `scrline/perc/op/srcline_num/total${pipelinesFilter()}${timeFilter()}/top(srclines)?${event()}`;
        case BackendQueryType.other:
            return 'error - bad request to backend';
    }
}


