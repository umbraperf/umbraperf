import { StateMutationType } from "../model/state_mutation";
import { createResultObject } from "../model/core_result";
import store from '../app';
import { WorkerAPI } from "../worker_api";
import * as ArrowTable from "../../node_modules/apache-arrow/table";


export interface FileInfo {
    fileName: string;
    file: File | undefined;
}

export interface CalculateChartParams {
   bucketsize: number | undefined;
}

const emptyCalculateChartParams: CalculateChartParams =  {
    bucketsize: undefined,
}

export enum ChartType{
    BAR_CHART = "bar_chart",
    SWIM_LANES = "swim_lanes",
}

const worker = new WorkerAPI();

export class WebFileController {

    public registerFileAtWorker(file: File) {
        worker.registerFile(file);
    }

    public calculateChartData(chartType: string, event: string, partialData?: any){
        const completeParams: CalculateChartParams = {...emptyCalculateChartParams, ...partialData}
        worker.calculateChartData(chartType, event, completeParams);
    }
}

export function storeEventsFromRust(requestId: number, events: Array<string>){
    
    store.dispatch({
        type: StateMutationType.SET_EVENTSLOADING,
        data: false,
    });
    store.dispatch({
        type: StateMutationType.SET_EVENTS,
        data: events,
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
