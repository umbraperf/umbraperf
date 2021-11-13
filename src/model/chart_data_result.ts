import { ChartType } from '../model';

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
    | ChartData<ChartType.SWIM_LANES, ISwimlanesData>
    | ChartData<ChartType.SWIM_LANES_PIPELINES, Array<ISwimlanesData>>
    | ChartData<ChartType.SWIM_LANES_MULTIPLE_PIPELINES, ISwimlanesData>
    | ChartData<ChartType.SWIM_LANES_MULTIPLE_PIPELINES_ABSOLUTE, ISwimlanesData>
    | ChartData<ChartType.SWIM_LANES_COMBINED_MULTIPLE_PIPELINES, ISwimlanesCombinedData>
    | ChartData<ChartType.SWIM_LANES_COMBINED_MULTIPLE_PIPELINES_ABSOLUTE, ISwimlanesCombinedData>
    | ChartData<ChartType.DONUT_CHART, IDonutChartData>
    | ChartData<ChartType.BAR_CHART_ACTIVITY_HISTOGRAM, IBarChartActivityHistogramData>
    | ChartData<ChartType.SUNBURST_CHART, ISunburstChartData>
    | ChartData<ChartType.MEMORY_ACCESS_HEATMAP_CHART, IMemoryAccessHeatmapChartData>
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

export interface IDonutChartData {
    pipeline: Array<string>,
    count: Array<number>,
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

