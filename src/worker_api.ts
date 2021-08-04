import { storeWorkerResultInCore } from './controller/web_file_controller';
import * as model from './worker';
import * as profiler_core from '../crate/pkg/shell';


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



/*         this.worker.onmessage = responseMessage => {
            if (responseMessage.data.type == model.WorkerResponseType.REGISTERED_FILE) {
                console.log(this.worker);
                //profiler_core.analyzeFile();
                //worker.terminate();
                return 5;
            }

        } */
    }

    //TODO remove
    public readChunk(offset: number, chunkSize: number) {
        this.worker.postMessage({
            type: model.WorkerRequestType.READ_CHUNK,
            data: {
                offset: offset,
                chunkSize: chunkSize,
            }
        });

        return new Promise((resolve, reject) => {

        })
        /* 
                let promise = new Promise((resolve, reject) => {
                    // the function is executed automatically when the promise is constructed
        
                    this.worker.onmessage = (responeMessage) => {
                        if (responeMessage.data.type == model.WorkerResponseType.SENT_UINT8) {
                            console.log(responeMessage);
        
                            resolve(responeMessage.data.data);
                        }
                    }
                });
        
                return promise; */


        /*         this.worker.onmessage = (responeMessage) => {
                    if(responeMessage.data.type == model.WorkerResponseType.SENT_UINT8){
                        console.log(responeMessage);
                        return responeMessage.data.data;
                    }
        
                } */
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

    if (!message.type) return;

    const messageType = message.data.type;
    const messageData = message.data.data;


    switch (messageType) {

        case model.WorkerResponseType.STORE_RESULT:
            console.log(messageData);
            //TODO result from rust in redux, stop loading redux
            break;


        default:
            console.log(`UNKNOWN RESPONSE TYPE ${messageType}`);



    }
});

