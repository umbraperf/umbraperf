import { StateMutationType } from "./state_mutation";
import { Result, createResultObject } from "./core_result";
import store from '../app';
import * as profiler_core from '../../crate/pkg/shell';
//import { WorkerAPI } from "../worker_api";



export interface FileInfo {
    fileName: string;
    file: File | undefined;
}

export class WebFile {

    //worker = new WorkerAPI;

    public setNewFile(fileName: string, file: File, requestingComponent: string): void {

        //this.worker.registerFile(file);

        store.dispatch({
            type: StateMutationType.SET_FILENAME,
            data: fileName,
        });

        store.dispatch({
            type: StateMutationType.SET_FILE,
            data: file,
        });

        store.dispatch({
            type: StateMutationType.SET_RESULT,
            data: undefined,
        });

        // TODO add requesting component to rust call
        profiler_core.triggerScanFile(this);

    }

    public getLength(){
        if(undefined !== store.getState().file){
            return store.getState().file?.size as number;
        }

    }

    public async askJsForChunk(offset: number, chunkSize: number) {

        const file = store.getState().file;
        if (file != undefined) {
            const remainingFileSize = file.size - offset;
            let chunk = undefined;
            if (remainingFileSize > 0) {
                const readHere = Math.min(remainingFileSize, chunkSize);
                chunk = file.slice(offset, offset + readHere);
            }
            const arrayBufferChunk = await chunk?.arrayBuffer();
            console.log(arrayBufferChunk);
            return new Uint8Array(arrayBufferChunk!);

        }
    }

    public storeResultFromRust(request: string, x: Array<any>, y?: Array<any>, z?: Array<any>) {

        console.log("result received from rust!");
        const result = createResultObject(request, x, y, z);
        console.log(result);
    
        store.dispatch({
            type: StateMutationType.SET_RESULTLOADING,
            data: false,
        });
        store.dispatch({
            type: StateMutationType.SET_RESULT,
            data: result,
        });
        console.log(store.getState());
    }
}