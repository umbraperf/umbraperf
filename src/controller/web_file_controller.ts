import { StateMutationType } from "../model/state_mutation";
import { createResultObject, Result } from "../model/core_result";
import { createChartDataObject, ChartDataObject, ChartDataKeyValue, ISwimlanesData } from "../model/chart_data_result";
import { store } from '../app';
import { WorkerAPI } from "../worker_api";
import * as ArrowTable from "../../node_modules/apache-arrow/table";
import * as RestApi from '../model/rest_queries';



export interface FileInfo {
    fileName: string;
    file: File | undefined;
}

export enum ChartType {
    BAR_CHART = "bar_chart",
    DONUT_CHART = "donut_chart",
    SWIM_LANES = "swim_lanes",
    SWIM_LANES_PIPELINES = "swim_lanes_pipelines",
    SWIM_LANES_MULTIPLE_PIPELINES = "swim_lanes_multiple_pipelines",
}

const worker = new WorkerAPI();

export class WebFileController {

    public registerFileAtWorker(file: File) {
        worker.registerFile(file);
    }


    public calculateChartData(restQueryType: RestApi.RestQueryType, restQuery: string, metaRequest: boolean, requestingChartId?: number, metadata?: string) {

        //TODO: metadata currently never used, can be removed
        const queryMetadata = metadata ? metadata : "";
        const queryRequestId = requestingChartId === undefined ? -1 : requestingChartId;

        store.dispatch({
            type: StateMutationType.SET_CURRENTREQUEST,
            data: restQueryType,
        });

/*         let resultLoadingObject = store.getState().resultLoading;
        requestingChartId ? resultLoadingObject[requestingChartId] = true :  resultLoadingObject[-1] = true; */
        store.dispatch({
            type: StateMutationType.SET_RESULTLOADING,
            data: {key: requestingChartId ? requestingChartId : -1, value: true},
        });

        store.dispatch({
            type: StateMutationType.SET_RESULT,
            data: undefined,
        });

        worker.calculateChartData(queryMetadata, restQuery, queryRequestId, metaRequest, restQueryType);
    }
}

export function setCsvReadingFinished() {

    store.dispatch({
        type: StateMutationType.SET_CSVPARSINGFINISHED,
        data: true,
    });
}

export function storeResultFromRust(requestId: number, result: ArrowTable.Table<any>, metaRequest: boolean, restQueryType: RestApi.RestQueryType) {

    //store result of current request in redux store result variable 
    const resultObject: Result = createResultObject(requestId, result);

    store.dispatch({
        type: StateMutationType.SET_RESULT,
        data: resultObject,
    });

    //store metadata if result was answer to meta request:
    if (metaRequest) {
        storeMetaDataFromRust(restQueryType);
    }

    //append new result to redux store chartDataArray and extract chart data for regarding chart type:
    if (!metaRequest) {
        storeChartDataFromRust(requestId, resultObject, restQueryType);
    }
}

//extract events from result table, store them to app state, set current event
function storeMetaDataFromRust(restQueryType: RestApi.RestQueryType) {

    switch (restQueryType) {

        case RestApi.RestQueryType.GET_EVENTS:
            const events = store.getState().result?.resultTable.getColumn('ev_name').toArray();
            store.dispatch({
                type: StateMutationType.SET_EVENTS,
                data: events,
            });
            store.dispatch({
                type: StateMutationType.SET_CURRENTEVENT,
                data: events[0],
            });
            break;

        case RestApi.RestQueryType.GET_PIPELINES:
            const pipelines = store.getState().result?.resultTable.getColumn('pipeline').toArray();
            store.dispatch({
                type: StateMutationType.SET_PIPELINES,
                data: pipelines,
            });
            store.dispatch({
                type: StateMutationType.SET_CURRENTPIPELINE,
                data: pipelines,
            });
            break;
    }

/*     let resultLoadingObject = store.getState().resultLoading;
    resultLoadingObject[-1] = false; */
    store.dispatch({
        type: StateMutationType.SET_RESULTLOADING,
        data: {key: -1, value: false},
    });

}

//store data arriving from rust that were caused for visualizations in a collection for chart data in redux store
function storeChartDataFromRust(requestId: number, resultObject: Result, requestType: RestApi.RestQueryType) {
    let chartDataElem: ChartDataObject | undefined;
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

            let dataArray: Array<ISwimlanesData> = (store.getState().chartData[requestId] as ChartDataObject) ? (store.getState().chartData[requestId] as ChartDataObject).chartData.data as ISwimlanesData[] : new Array<ISwimlanesData>();
            const data: ISwimlanesData = {
                buckets: resultObject.resultTable.getColumn('bucket').toArray(),
                operators: resultObject.resultTable.getColumn('operator').toArray(),
                relativeFrquencies: resultObject.resultTable.getColumn('relfreq').toArray(),
            }
            dataArray.push(data);

            let multipleChartDataLength = store.getState().multipleChartDataLength + 1;

            store.dispatch({
                type: StateMutationType.SET_MULTIPLECHARTDATALENGTH,
                data: multipleChartDataLength,
            });

            chartDataElem = createChartDataObject(
                requestId,
                {
                    chartType: ChartType.SWIM_LANES_PIPELINES,
                    data: dataArray,
                });

            break;

        case RestApi.RestQueryType.GET_REL_OP_DISTR_PER_BUCKET_PER_MULTIPLE_PIPELINES:

            chartDataElem = createChartDataObject(
                requestId,
                {
                    chartType: ChartType.SWIM_LANES_MULTIPLE_PIPELINES,
                    data: {
                        buckets: resultObject.resultTable.getColumn('bucket').toArray(),
                        operators: resultObject.resultTable.getColumn('operator').toArray(),
                        relativeFrquencies: resultObject.resultTable.getColumn('relfreq').toArray(),
                    }
                });
            break;

        case RestApi.RestQueryType.GET_PIPELINE_COUNT:

            chartDataElem = createChartDataObject(
                requestId,
                {
                    chartType: ChartType.DONUT_CHART,
                    data: {
                        pipeline: resultObject.resultTable.getColumn('pipeline').toArray(),
                        count: resultObject.resultTable.getColumn('count').toArray(),
                    }
                });
            break;

    }

    ChartDataCollection[requestId] = chartDataElem!;
    store.dispatch({
        type: StateMutationType.SET_CHARTDATA,
        data: ChartDataCollection,
    });

/*     let resultLoadingObject = store.getState().resultLoading;
    resultLoadingObject[requestId] = false; */
    store.dispatch({
        type: StateMutationType.SET_RESULTLOADING,
        data: {key: requestId, value: false},
    });
    console.log(store.getState().chartData[requestId].chartData);

}

export function requestChartData(controller: WebFileController, chartId: number, chartType: ChartType, metadata?: { bucksetsize?: string, pipeline?: string }) {

    switch (chartType) {

        case ChartType.BAR_CHART:

            controller.calculateChartData(
                RestApi.RestQueryType.GET_OPERATOR_FREQUENCY_PER_EVENT,
                RestApi.createRestQuery({
                    type: RestApi.RestQueryType.GET_OPERATOR_FREQUENCY_PER_EVENT,
                    data: { event: store.getState().currentEvent, pipelines: metadata!.pipeline! },
                }), false, chartId);
            break;

        case ChartType.SWIM_LANES:

            controller.calculateChartData(

                RestApi.RestQueryType.GET_REL_OP_DISTR_PER_BUCKET,
                RestApi.createRestQuery({
                    type: RestApi.RestQueryType.GET_REL_OP_DISTR_PER_BUCKET,
                    data: { event: store.getState().currentEvent, time: metadata!.bucksetsize! },
                }), false, chartId);
            break;

        case ChartType.SWIM_LANES_PIPELINES:

            resetChartDataInStore(chartId);
            controller.calculateChartData(
                RestApi.RestQueryType.GET_REL_OP_DISTR_PER_BUCKET_PER_PIPELINE,
                RestApi.createRestQuery({
                    type: RestApi.RestQueryType.GET_REL_OP_DISTR_PER_BUCKET_PER_PIPELINE,
                    data: { event: store.getState().currentEvent, time: metadata!.bucksetsize! },
                }), false, chartId);
            break;

        case ChartType.SWIM_LANES_MULTIPLE_PIPELINES:

            controller.calculateChartData(
                RestApi.RestQueryType.GET_REL_OP_DISTR_PER_BUCKET_PER_MULTIPLE_PIPELINES,
                RestApi.createRestQuery({
                    type: RestApi.RestQueryType.GET_REL_OP_DISTR_PER_BUCKET_PER_MULTIPLE_PIPELINES,
                    data: { event: store.getState().currentEvent, time: metadata!.bucksetsize!, pipelines: metadata!.pipeline! },
                }), false, chartId);
            break;

        case ChartType.DONUT_CHART:

            controller.calculateChartData(
                RestApi.RestQueryType.GET_PIPELINE_COUNT,
                RestApi.createRestQuery({
                    type: RestApi.RestQueryType.GET_PIPELINE_COUNT,
                    data: { event: store.getState().currentEvent },
                }), false, chartId);
            break;

    }

}


//request events from rust, metarequest
export function requestEvents(controller: WebFileController) {
    controller.calculateChartData(
        RestApi.RestQueryType.GET_EVENTS,
        RestApi.createRestQuery({
            type: RestApi.RestQueryType.GET_EVENTS,
            data: {},
        }), true);
}

//request pipelines from rust, metarequest
export function requestPipelines(controller: WebFileController) {
    controller.calculateChartData(
        RestApi.RestQueryType.GET_PIPELINES,
        RestApi.createRestQuery({
            type: RestApi.RestQueryType.GET_PIPELINES,
            data: {},
        }), true);
}

//request statistics such as number of pipelines, number of cycles, ... from rust, metarequest
export function requestStatistics(controller: WebFileController) {
    //TODO 

}

export function resetChartDataInStore(chartId: number) {

    let chartData = store.getState().chartData;
    delete chartData[chartId];
    let newChartData: ChartDataKeyValue = { ...chartData }

    store.dispatch({
        type: StateMutationType.SET_CHARTDATA,
        data: newChartData,
    });
    store.dispatch({
        type: StateMutationType.SET_MULTIPLECHARTDATALENGTH,
        data: -1,
    });

}
