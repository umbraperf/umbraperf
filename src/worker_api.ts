import * as Controller from './controller';
import * as model from './worker';
import * as ArrowTable from "../node_modules/apache-arrow/table";
import { ICalculateChartDataRequestData } from './worker';
import * as BackendApi from './model/backend_queries';



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

    public calculateChartData(backendQuery: string, requestId: number, metaRequest: boolean, backendQueryType: BackendApi.BackendQueryType) {
        const requestData: ICalculateChartDataRequestData = {
            backendQuery: backendQuery,
            metaRequest: metaRequest,
            requestId: requestId,
            backendQueryType: backendQueryType,
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

    console.log(messageData.backendQueryType);

    switch (messageType) {

        case model.WorkerResponseType.CSV_READING_FINISHED:
            Controller.setCsvReadingFinished();
            break;

        case model.WorkerResponseType.STORE_RESULT:
            const resultRequestId = messageData.requestId;
            const resultChartData = messageData.chartData;
            const resultArrowTable = ArrowTable.Table.from(resultChartData);
            const resultBackendQueryType = messageData.backendQueryType;
            const metaRequest = messageData.metaRequest;
            Controller.storeResultFromRust(resultRequestId, resultArrowTable, metaRequest, resultBackendQueryType);
            break;

        case model.WorkerResponseType.STORE_QUERYPLAN:
            // Controller.storeQueryPlan(messageData);
            const queryPlanData = messageData.queryPlanData;
            const queryPlanRequestId = messageData.requestId;
            const queryPlanBackendQueryType = messageData.backendQueryType;
            Controller.storeResultFromRust(queryPlanRequestId, ArrowTable.Table.empty(), false, queryPlanBackendQueryType, queryPlanData);
            break;

        default:
            console.log("Unknown message type from worker.");

    }
});

