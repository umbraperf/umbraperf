import * as Controller from './controller/response_controller';
import * as model from './worker';
import * as ArrowTable from "../node_modules/apache-arrow/table";
import { ICalculateChartDataRequestData } from './worker';
import * as RestApi from './model/rest_queries';



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

    public calculateChartData(metadata: string, restQuery: string, requestId: number, metaRequest: boolean, restQueryType: RestApi.RestQueryType) {
        const requestData: ICalculateChartDataRequestData = {
            queryMetadata: metadata,
            restQuery: restQuery,
            metaRequest: metaRequest,
            requestId: requestId,
            restQueryType: restQueryType,
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
            Controller.setCsvReadingFinished();
            break;

        case model.WorkerResponseType.STORE_RESULT:
            const requestId = messageData.requestId;
            const resultChartData = messageData.chartData;
            const restQueryType = messageData.restQueryType;
            const arrowResultTable = ArrowTable.Table.from(resultChartData);
            const metaRequest = messageData.metaRequest;
            Controller.storeResultFromRust(requestId, arrowResultTable, metaRequest, restQueryType);
            break;

        case model.WorkerResponseType.STORE_QUERYPLAN:
            Controller.storeQueryPlan(messageData);
            break;

        default:
            console.log("Unknown message type from worker.");

    }
});

