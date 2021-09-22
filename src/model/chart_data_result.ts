import { ChartType } from '../model';

export interface ChartDataKeyValue{
    [chartId:number ]: ChartDataObject;
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
    | ChartData<ChartType.DONUT_CHART, IDonutChartData>
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
    relativeFrquencies: Array<number>,
}

export interface IDonutChartData {
    pipeline: Array<string>,
    count: Array<number>,
}