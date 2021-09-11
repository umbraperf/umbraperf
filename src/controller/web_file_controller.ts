import { StateMutationType } from "../model/state_mutation";
import { createResultObject, Result } from "../model/core_result";
import { createChartDataObject, ChartDataObject, ChartDataKeyValue } from "../model/chart_data_result";
import { store } from '../app';
import { WorkerAPI } from "../worker_api";
import * as ArrowTable from "../../node_modules/apache-arrow/table";
import * as RestApi from '../model/rest_queries';



export interface FileInfo {
    fileName: string;
    file: File | undefined;
}

export interface CalculateChartParams {
    bucketsize: number | undefined;
}

const emptyCalculateChartParams: CalculateChartParams = {
    bucketsize: undefined,
}

export enum ChartType {
    BAR_CHART = "bar_chart",
    SWIM_LANES = "swim_lanes",
    SWIM_LANES_PIPELINES = "swim_lanes_pipelines",
}

const worker = new WorkerAPI();

export class WebFileController {

    public registerFileAtWorker(file: File) {
        worker.registerFile(file);
    }


    public calculateChartData(restQueryType: RestApi.RestQueryType, restQuery: string, eventsRequest: boolean, requestingChartId?: number, metadata?: string) {
        const queryMetadata = metadata ? metadata : "";

        const queryRequestId = requestingChartId === undefined ? -1 : requestingChartId;

        store.dispatch({
            type: StateMutationType.SET_CURRENTREQUEST,
            data: restQueryType,
        });
        store.dispatch({
            type: StateMutationType.SET_RESULTLOADING,
            data: true,
        });
        store.dispatch({
            type: StateMutationType.SET_RESULT,
            data: undefined,
        });

        worker.calculateChartData(queryMetadata, restQuery, queryRequestId, eventsRequest);
    }
}

export function setCsvReadingFinished(requestId: number) {

    store.dispatch({
        type: StateMutationType.SET_CSVPARSINGFINISHED,
        data: true,
    });
}

export function storeResultFromRust(requestId: number, result: ArrowTable.Table<any>, eventsRequest: boolean) {

    //store result of current request in redux store result variable 
    console.log(result);
    const resultObject: Result = createResultObject(requestId, result);

    store.dispatch({
        type: StateMutationType.SET_RESULT,
        data: resultObject,
    });

    //store events if result was answer to events request:
    if (eventsRequest) {
        storeEventsFromRust();
    }

    //append new result to redux store chartDataArray and extract chart data for regarding chart type:
    if (!eventsRequest) {
        storeChartDataFromRust(requestId, resultObject);
        console.log(store.getState().chartData);
    }
}

//request events from rust for specific chart type
export function requestEvents(controller: WebFileController) {
    controller.calculateChartData(
        RestApi.RestQueryType.GET_EVENTS,
        RestApi.createRestQuery({
            type: RestApi.RestQueryType.GET_EVENTS,
            data: {},
        }), true);

}

//extract events from result table, store them to app state, set current event
function storeEventsFromRust() {
    const events = store.getState().result?.resultTable.getColumn('ev_name').toArray();
    const currentEvent = events[0];
    store.dispatch({
        type: StateMutationType.SET_EVENTS,
        data: events,
    });
    store.dispatch({
        type: StateMutationType.SET_CURRENTEVENT,
        data: currentEvent,
    });

}

function storeChartDataFromRust(requestId: number, resultObject: Result) {
    const requestType = store.getState().currentRequest;
    let chartDataElem: ChartDataObject | Array<ChartDataObject> | undefined;
    let ChartDataCollection: ChartDataKeyValue = store.getState().chartData;

    switch (requestType) {

        case RestApi.RestQueryType.GET_OPERATOR_FREQUENCY_PER_EVENT:
            chartDataElem = createChartDataObject(
                requestId,
                {
                    chartType: ChartType.BAR_CHART,
                    data: {
                        operators: resultObject.resultTable.getColumn('operator').toArray(),
                        frequency: resultObject.resultTable.getColumn('count').toArray(),
                    }
                });
            break;

        case RestApi.RestQueryType.GET_REL_OP_DISTR_PER_BUCKET:
            chartDataElem = createChartDataObject(
                requestId,
                {
                    chartType: ChartType.SWIM_LANES,
                    data: {
                        buckets: resultObject.resultTable.getColumn('bucket').toArray(),
                        operators: resultObject.resultTable.getColumn('operator').toArray(),
                        relativeFrquencies: resultObject.resultTable.getColumn('relfreq').toArray(),
                    }
                });
            break;
        case RestApi.RestQueryType.GET_REL_OP_DISTR_PER_BUCKET_PER_PIPELINE:
            console.log();
            const singleChartDataElem = createChartDataObject(
                requestId,
                {
                    chartType: ChartType.SWIM_LANES,
                    data: {
                        buckets: resultObject.resultTable.getColumn('bucket').toArray(),
                        operators: resultObject.resultTable.getColumn('operator').toArray(),
                        relativeFrquencies: resultObject.resultTable.getColumn('relfreq').toArray(),
                    }
                });
                
                let chartDataElemArray: Array<ChartDataObject> = ChartDataCollection[requestId] ? ChartDataCollection[requestId] as Array<ChartDataObject> : [];
                chartDataElemArray.push(singleChartDataElem);
                chartDataElem = chartDataElemArray;
            break;

    }

    ChartDataCollection[requestId] = chartDataElem!;
    store.dispatch({
        type: StateMutationType.SET_CHARTDATA,
        data: ChartDataCollection,
    });
    store.dispatch({
        type: StateMutationType.SET_RESULTLOADING,
        data: false,
    });

}

export function createRequestForRust(controller: WebFileController, chartId: number, chartType: ChartType, metadata?: string) {

    switch (chartType) {

        case ChartType.BAR_CHART:

            controller.calculateChartData(
                RestApi.RestQueryType.GET_OPERATOR_FREQUENCY_PER_EVENT,
                RestApi.createRestQuery({
                    type: RestApi.RestQueryType.GET_OPERATOR_FREQUENCY_PER_EVENT,
                    data: { event: store.getState().currentEvent },
                }), false, chartId);
            break;

        case ChartType.SWIM_LANES:

            controller.calculateChartData(
                /*                 SqlApi.SqlQueryType.GET_REL_OP_DISTR_PER_BUCKET_PER_PIPELINE,
                 */
                RestApi.RestQueryType.GET_REL_OP_DISTR_PER_BUCKET,
                RestApi.createRestQuery({
                    type: RestApi.RestQueryType.GET_REL_OP_DISTR_PER_BUCKET,
                    data: { event: store.getState().currentEvent },
                }), false, chartId, `{time: ${metadata}}`);
            break;

        case ChartType.SWIM_LANES_PIPELINES:

            controller.calculateChartData(
                RestApi.RestQueryType.GET_REL_OP_DISTR_PER_BUCKET_PER_PIPELINE,
                RestApi.createRestQuery({
                    type: RestApi.RestQueryType.GET_REL_OP_DISTR_PER_BUCKET_PER_PIPELINE,
                    data: { event: store.getState().currentEvent },
                }), false, chartId, `{time: ${metadata}}`);
            break;



    }

}
