import { setCsvReadingFinished, storeResultFromRust } from './controller/web_file_controller';
import * as model from './worker';
import * as ArrowTable from "../node_modules/apache-arrow/table";
import { ICalculateChartDataRequestData } from './worker';


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

    public calculateChartData(metadata: string, restQuery: string, requestId: number, eventsRequest: boolean){
        const requestData: ICalculateChartDataRequestData = {
            queryMetadata: metadata,
            restQuery: restQuery,
            requestId: requestId,
            eventsRequest: eventsRequest,
        }

        this.worker.postMessage({
            type: model.WorkerRequestType.CALCULATE_CHART_DATA,
            data: requestData,
        });
    }

}

//Responses from Worker to Main:
worker.addEventListener('message', message => {

    if (!message.type) return;

    const messageType = message.data.type;
    const messageData = message.data.data;


    switch (messageType) {

        case model.WorkerResponseType.CSV_READING_FINISHED:
            setCsvReadingFinished(messageData as number);
            break;

        case model.WorkerResponseType.STORE_RESULT:
            console.log(messageData);
            const arrowResultTable = ArrowTable.Table.from(messageData);
            storeResultFromRust(message.data.requestId, arrowResultTable, message.data.eventsRequest);
            break;

        default:

    }
});

