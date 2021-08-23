import * as ArrowTable from "../../node_modules/apache-arrow/table";

export interface Result {
    request: number;
    resultTable: ArrowTable.Table<any>;
}

export function createResultObject(request: number, resultTable: ArrowTable.Table<any>): Result {
    return {
        request: request,
        resultTable: resultTable,
    };
}