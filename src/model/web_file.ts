import { StateMutationType } from "./state_mutation";
import store from '../app';
import * as profiler_core from '../../crate/pkg/shell';



export interface FileInfo {
    fileName: string;
    file: File | undefined;
}

export function setNewFile(fileName: string, file: File): void{

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

    profiler_core.triggerScanFile();

} 

export async function askJsForChunk(offset: number, chunkSize: number){

    const file = store.getState().file;
    if(file != undefined){
        const remainingFileSize = file.size - offset;
        let chunk = undefined;
        if(remainingFileSize > 0){
            const readHere = Math.min(remainingFileSize, chunkSize);
            chunk = file.slice(offset, offset + readHere);
        }
        const arrayBufferChunk = await chunk?.arrayBuffer();
        return new Uint8Array(arrayBufferChunk!);

    }
}