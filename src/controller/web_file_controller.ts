import { StateMutationType } from "../model/state_mutation";
import { Result, createResultObject } from "../model/core_result";
import store from '../app';
import { WorkerAPI } from "src/worker_api";


export interface FileInfo {
    fileName: string;
    file: File | undefined;
}


export class WebFileController {

    worker: WorkerAPI;

    constructor(worker: WorkerAPI) {
        this.worker = worker;
    }

    public registerFileAtWorker(file: File) {
        this.worker.registerFile(file);
    }
}

export function storeResultFromRust(requestId: number, result: number) {

    console.log("result received from rust!");
    const resultObject = createResultObject(result, requestId, [], undefined, undefined);
    console.log(resultObject);

/*     store.dispatch({
        type: StateMutationType.SET_RESULTLOADING,
        data: false,
    }); */
/*     store.dispatch({
        type: StateMutationType.SET_RESULT,
        data: result,
    }); */
    //console.log(store.getState());
}
