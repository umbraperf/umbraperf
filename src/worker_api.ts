import * as model from './worker';

const worker = new Worker(new URL('./worker.ts', import.meta.url));


export class WorkerAPI {
    worker!: Worker;

    constructor() {
        this.worker = worker;
    }

    //Requests from Main to Worker:

    public registerFile(file: File) {
        this.worker.postMessage({
            type: model.WorkerRequestType.REGISTER_FILE,
            data: file
        });
    }

    public readChunk(offset: number, chunkSize: number) {
        this.worker.postMessage({
            type: model.WorkerRequestType.READ_CHUNK,
            data: {
                offset: offset,
                chunkSize: chunkSize,
            }
        });
    }

    public testWorker() {
        this.worker.postMessage({
            type: model.WorkerRequestType.TEST,
            data: "123"
        });
    }

}

//Responses from Worker to Main:

worker.addEventListener('message', message => {
    console.log(message);
});


