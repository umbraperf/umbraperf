import * as model from './model';

export class WorkerAPI {
    worker: Worker;


    public registerFile(file: File) {
        this.worker.postMessage({
            type: model.WorkerRequestType.REGISTER_FILE,
            data: file
        });
    }
}