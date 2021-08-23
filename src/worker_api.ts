import { storeResultFromRust } from './controller/web_file_controller';
import * as model from './worker';
import * as ArrowTable from "../node_modules/apache-arrow/table";


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

        //profiler_core.startFileReading(this.worker);
        console.log(this.worker);
    }

    //TODO remove
    public testWorker() {
        this.worker.postMessage({
            type: model.WorkerRequestType.TEST,
            data: "123"
        });
    }

}

//Responses from Worker to Main:
worker.addEventListener('message', message => {

    if (!message.type) return;

    const messageType = message.data.type;
    const messageData = message.data.data;


    switch (messageType) {

        case model.WorkerResponseType.STORE_RESULT:
            console.log(messageData);

            const arrowTable = ArrowTable.Table.from(messageData);
            console.log(arrowTable);

/*             if(col0){
                const array = col0.toArray()!;
                const jsarray = Array.from(array);

                console.log(jsarray);
            } */

            console.log("main got result from worker.");
            storeResultFromRust(message.data.requestId, arrowTable);
            break;


        default:
            console.log(`UNKNOWN RESPONSE TYPE ${messageType}`);

    }
});

