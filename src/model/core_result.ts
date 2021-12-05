import * as ArrowTable from "../../node_modules/apache-arrow/table";

export interface Result {
    request: number;
    rustResultTable: ArrowTable.Table<any>;
    queryPlan?: object;
}

export interface ResultLoading {
    [chartId:number ]: boolean;
}

export function createResultObject(request: number, resultTable: ArrowTable.Table<any>, queryPlan?: object): Result {
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