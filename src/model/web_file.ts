import { StateMutationType } from "./state_mutation";
import { Result } from "./core_result";
import store from '../app';
import * as profiler_core from '../../crate/pkg/shell';



export interface FileInfo {
    fileName: string;
    file: File | undefined;
}

export class WebFile {

    public setNewFile(fileName: string, file: File): void {

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

        profiler_core.triggerScanFile(this);

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

        console.log(request);
        console.log(x);
        const result = undefined;

        console.log("notification from rust");
        // const result = "" + profiler_core.getState();
    
        store.dispatch({
            type: StateMutationType.SET_RESULTLOADING,
            data: false,
        });
        store.dispatch({
            type: StateMutationType.SET_RESULT,
            data: result,
        });

    }
}