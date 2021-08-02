import * as model from './worker';


export class WorkerAPI {
    worker!: Worker;

    constructor(){
        this.worker = new Worker(new URL('./worker.ts', import.meta.url));
    }

    public registerFile(file: File) {
        this.worker.postMessage({
            type: model.WorkerRequestType.REGISTER_FILE,
            data: file
        });
    }

    public testWorker() {
        this.worker.postMessage({
            type: model.WorkerRequestType.TEST,
            data: "123"
        });
    }
} 