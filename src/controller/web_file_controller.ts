import { StateMutationType } from "../model/state_mutation";
import { createResultObject } from "../model/core_result";
import store from '../app';
import { WorkerAPI } from "../worker_api";
import * as ArrowTable from "../../node_modules/apache-arrow/table";
import * as SqlApi from '../model/sql_queries';



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

    public calculateChartData(sqlQueryType: SqlApi.SqlQueryType, sqlQuery: string, metadata?: string) {
        const queryMetadata = metadata ? metadata : "";

        store.dispatch({
            type: StateMutationType.SET_CURRENTREQUEST,
            data: sqlQueryType,
        });
        store.dispatch({
            type: StateMutationType.SET_RESULTLOADING,
            data: true,
        });
        store.dispatch({
            type: StateMutationType.SET_RESULT,
            data: undefined,
        });
        console.log(sqlQueryType);
        console.log(sqlQuery);
        worker.calculateChartData(queryMetadata, sqlQuery);
    }
}

export function setCsvReadingFinished(requestId: number) {

    store.dispatch({
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

//request events from rust for specific chart type
export function requestEvents(controller: WebFileController){
    controller.calculateChartData(
        SqlApi.SqlQueryType.GET_EVENTS,
        SqlApi.createSqlQuery({
            type: SqlApi.SqlQueryType.GET_EVENTS,
            data: {},
        }));

}

//extract events from result table, store them to app state, set current event
export function storeEventsFromRust(){
    const events = store.getState().result?.resultTable.getColumn('ev_name').toArray();
    const currentEvent = events[0];
    store.dispatch({
        type: StateMutationType.SET_EVENTS,
        data: events,
    });
    store.dispatch({
        type: StateMutationType.SET_CURRENTEVENT,
        data: currentEvent,
    });


}
