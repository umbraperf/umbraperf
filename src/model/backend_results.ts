import * as ArrowTable from "apache-arrow/table";
import { ChartType, ChartTypeReadable } from "./chart_types";

export interface IResult {
    request: number;
    rustResultTable: ArrowTable.Table<any>;
}

export interface IResultLoading {
    [chartId: number]: boolean;
}

export interface IResultLoadingReadableName {[chartId: number]: ChartTypeReadable}

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

export interface IKpiValuesFormated { 
    [kpi: number]: number 
};

export interface IOperatorsData {
    operatorsId: Array<string>,
    operatorsGroup: Array<string>,
    operatorsGroupSorted: Array<string>,
    operatorsNice: Array<string>,
}

export type HeatmapsOutlierDetectionDegrees = 0 | 1 | 2 | 3 | 4 | 5 | 6;

