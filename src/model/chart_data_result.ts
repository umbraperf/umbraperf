import { ChartType } from '.';

export interface ChartDataKeyValue {
    [chartId: number]: ChartDataObject;
}

export interface ChartDataObject {
    readonly chartId: number;
    readonly chartData: ChartDataVariant;
}


export type ChartData<T, P> = {
    readonly chartType: T;
    readonly data: P;
};

export type ChartDataVariant =
    | ChartData<ChartType.BAR_CHART, IBarChartData>
    | ChartData<ChartType.SWIM_LANES_MULTIPLE_PIPELINES, ISwimlanesData>
    | ChartData<ChartType.SWIM_LANES_MULTIPLE_PIPELINES_ABSOLUTE, ISwimlanesData>
    | ChartData<ChartType.SWIM_LANES_COMBINED_MULTIPLE_PIPELINES, ISwimlanesCombinedData>
    | ChartData<ChartType.SWIM_LANES_COMBINED_MULTIPLE_PIPELINES_ABSOLUTE, ISwimlanesCombinedData>
    | ChartData<ChartType.BAR_CHART_ACTIVITY_HISTOGRAM, IBarChartActivityHistogramData>
    | ChartData<ChartType.SUNBURST_CHART, ISunburstChartData>
    | ChartData<ChartType.MEMORY_ACCESS_HEATMAP_CHART, IMemoryAccessHeatmapChartData>
    | ChartData<ChartType.UIR_VIEWER, IUirViewerData>
    | ChartData<ChartType.QUERY_PLAN, IQueryPlanData>
    ;

export function createChartDataObject(chartId: number, chartData: ChartDataVariant): ChartDataObject {
    return {
        chartId: chartId,
        chartData: chartData,
    };
}

export interface IBarChartData {
    operators: Array<string>,
    frequency: Array<number>,
}

export interface ISwimlanesData {
    buckets: Array<number>,
    operators: Array<string>,
    frequency: Array<number>,
}

export interface ISwimlanesCombinedData {
    buckets: Array<number>,
    operators: Array<string>,
    frequency: Array<number>,
    bucketsNeg: Array<number>,
    operatorsNeg: Array<string>,
    frequencyNeg: Array<number>,
}

export interface IBarChartActivityHistogramData {
    timeBucket: Array<number>,
    occurrences: Array<number>,
}

export interface ISunburstChartData {
    operator: Array<string>;
    pipeline: Array<string | null>;
    opOccurrences: Array<number | null>;
    pipeOccurrences: Array<number | null>;
}

export interface IMemoryAccessHeatmapChartSingleData {
    operator: Array<string>,
    buckets: Array<number>,
    memoryAdress: Array<number>,
    occurrences: Array<number>
}

export interface IMemoryAccessHeatmapChartDomainData {
    memoryDomain: { max: number, min: number },
    timeDomain: { max: number, min: number },
    frequencyDomain: { max: number, min: number },
    numberOperators: number,
}

export interface IMemoryAccessHeatmapChartData {
    domain: IMemoryAccessHeatmapChartDomainData,
    heatmapsData: Array<IMemoryAccessHeatmapChartSingleData>,
}

export interface IUirViewerData {
    uirLines: Array<string>;
    event1: Array<number>;
    event2: Array<number>;
    event3: Array<number>;
    event4: Array<number>;
    relEvent1: Array<number>;
    relEvent2: Array<number>;
    relEvent3: Array<number>;
    relEvent4: Array<number>;
    operators: Array<string>;
    pipelines: Array<string>;
    isFunction: Array<number>;
}

export interface IQueryPlanNodeTooltipData {
    uirLineNumbers: Array<number>;
    uirLines: Array<string>;
    eventOccurrences: Array<number>;
    operatorTotalFrequency: Array<number>;
    operators: Array<string>;
}

export interface IQueryPlanData {
    queryplanData: object | undefined;
    nodeTooltipData: IQueryPlanNodeTooltipData;
}

