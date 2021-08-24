import { StateMutationType } from "../model/state_mutation";
import { createResultObject } from "../model/core_result";
import store from '../app';
import { WorkerAPI } from "src/worker_api";
import * as ArrowTable from "../../node_modules/apache-arrow/table";
import { EventSeatOutlined } from "@material-ui/icons";



export interface FileInfo {
    fileName: string;
    file: File | undefined;
}

export enum ChartType{
    BAR_CHART = "bar-chart",
    SWIM_LANES = "swim-lanes",
}


export class WebFileController {

    worker: WorkerAPI;

    constructor(worker: WorkerAPI) {
        this.worker = worker;
    }

    public registerFileAtWorker(file: File) {
        this.worker.registerFile(file);
    }

    public calculateChartData(chartType: string, event: string){
        this.worker.calculateChartData(chartType, event);
    }
}

export function storeEventsFromRust(requestId: number, events: Array<string>){
    
    console.log("events received from rust!");

    store.dispatch({
        type: StateMutationType.SET_EVENTSLOADING,
        data: false,
    });
    store.dispatch({
        type: StateMutationType.SET_EVENTS,
        data: events,
    });

    console.log(store.getState());
}

export function storeResultFromRust(requestId: number, result: ArrowTable.Table<any>) {

    console.log("result received from rust!");
    const resultObject = createResultObject(requestId, result);
    console.log(resultObject);

    store.dispatch({
        type: StateMutationType.SET_RESULTLOADING,
        data: false,
    });
    store.dispatch({
        type: StateMutationType.SET_RESULT,
        data: resultObject,
    });
    console.log(store.getState()); 
}
