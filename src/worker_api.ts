import { setCsvReadingFinished, storeResultFromRust } from './controller/web_file_controller';
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

    }

/*     public calculateChartData(chartType: string, event: string, params: any){
        this.worker.postMessage({
            type: model.WorkerRequestType.CALCULATE_CHART_DATA,
            data: {chartType: chartType, event: event, params: params},
        });
    } */

    public calculateChartData(sqlQuery: string){
        this.worker.postMessage({
            type: model.WorkerRequestType.CALCULATE_CHART_DATA,
            data: sqlQuery,
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
            //const arrowEventsTable = ArrowTable.Table.from(messageData);
            //const events: Array<string> = arrowEventsTable.getColumn("event_name")?.toArray();
            setCsvReadingFinished(messageData as number);
            break;

        case model.WorkerResponseType.STORE_RESULT:
            const arrowResultTable = ArrowTable.Table.from(messageData);
            storeResultFromRust(message.data.requestId, arrowResultTable);
            break;

        default:

    }
});

