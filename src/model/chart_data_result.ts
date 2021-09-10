import { ChartType } from '../controller/web_file_controller'

export type ChartData<T, P> = {
    readonly chartId: number;
    readonly chartType: T;
    readonly data: P;
};

export type ChartDataVariant =
    | ChartData<ChartType.BAR_CHART, IBarChartData>
    | ChartData<ChartType.SWIM_LANES, ISwimlanesData>
    ;

interface IBarChartData {
    operators: Array<string>,
    frequency: Array<number>,
}

interface ISwimlanesData {
    buckets: Array<number>,
    operators: Array<string>,
    relativeFrquencies: Array<number>,
}