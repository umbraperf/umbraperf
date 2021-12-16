import * as ArrowTable from "apache-arrow/table";

export interface IResult {
    request: number;
    rustResultTable: ArrowTable.Table<any>;
    queryPlan?: object;
}

export interface IResultLoading {
    [chartId:number ]: boolean;
}

export function createResultObject(request: number, resultTable: ArrowTable.Table<any>, queryPlan?: object): IResult {
    return {
        request: request,
        rustResultTable: resultTable,
        queryPlan: queryPlan,
    };
}

export interface IKpiData{
    id: string,
    title: string,
    value: string,
}

export interface IOperatorsData{
    operatorsId: Array<string>,
    operatorsGroup: Array<string>,
    operatorsNice: Array<string>,
}