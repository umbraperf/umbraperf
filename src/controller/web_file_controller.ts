import { StateMutationType } from "../model/state_mutation";
import { createResultObject } from "../model/core_result";
import store from '../app';
import { WorkerAPI } from "../worker_api";
import * as ArrowTable from "../../node_modules/apache-arrow/table";
import { SqlQueries } from "src/model/sql_queries";


export interface FileInfo {
    fileName: string;
    file: File | undefined;
}

export interface CalculateChartParams {
    bucketsize: number | undefined;
}

const emptyCalculateChartParams: CalculateChartParams = {
    bucketsize: undefined,
}

export enum ChartType {
    BAR_CHART = "bar_chart",
    SWIM_LANES = "swim_lanes",
}

const worker = new WorkerAPI();

export class WebFileController {

    public registerFileAtWorker(file: File) {
        worker.registerFile(file);
    }

    /*     public calculateChartData(chartType: string, event: string, partialData?: any){
            const completeParams: CalculateChartParams = {...emptyCalculateChartParams, ...partialData}
            worker.calculateChartData(chartType, event, completeParams);
        } */

    public calculateChartData(sqlQuery: SqlQueries) {
        store.dispatch({
            type: StateMutationType.SET_CURRENTREQUEST,
            data: sqlQuery,
        });
        store.dispatch({
            type: StateMutationType.SET_RESULTLOADING,
            data: true,
        });
        store.dispatch({
            type: StateMutationType.SET_RESULT,
            data: undefined,
        });
        worker.calculateChartData(sqlQuery);
    }
}

export function setCsvReadingFinished(requestId: number) {

    store.dispatch({
        // TODO:
        type: StateMutationType.SET_CSVPARSINGFINISHED,
        data: true,
    });
}

export function storeResultFromRust(requestId: number, result: ArrowTable.Table<any>) {

    const resultObject = createResultObject(requestId, result);

    store.dispatch({
        type: StateMutationType.SET_RESULTLOADING,
        data: false,
    });
    store.dispatch({
        type: StateMutationType.SET_RESULT,
        data: resultObject,
    });
}
