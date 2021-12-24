import * as ArrowTable from "apache-arrow/table";

export interface IResult {
    request: number;
    rustResultTable: ArrowTable.Table<any>;
}

export interface IResultLoading {
    [chartId: number]: boolean;
}

export function createResultObject(request: number, resultTable: ArrowTable.Table<any>): IResult {
    return {
        request: request,
        rustResultTable: resultTable,
    };
}

export interface IKpiData {
    id: string,
    title: string,
    value: string,
}

export interface IOperatorsData {
    operatorsId: Array<string>,
    operatorsGroup: Array<string>,
    operatorsNice: Array<string>,
}

export type HeatmapsOutlierDetectionDegrees = 0 | 1 | 2 | 3 | 4 | 5 | 6;

export type KpiValuesFormated = {[kpi: number]: number};