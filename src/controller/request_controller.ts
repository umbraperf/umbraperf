import * as model from "../model";
import { store } from '../app';
import { WorkerAPI } from "../worker_api";


const worker = new WorkerAPI();

export class RequestController {

    public registerFileAtWorker(file: File) {
        worker.registerFile(file);
    }


    public calculateChartData(restQueryType: model.RestQueryType, restQuery: string, metaRequest: boolean, requestingChartId?: number, metadata?: string) {

        //TODO: metadata currently never used, can be removed
        const queryMetadata = metadata ? metadata : "";
        const queryRequestId = requestingChartId === undefined ? -1 : requestingChartId;

        store.dispatch({
            type: model.StateMutationType.SET_CURRENTREQUEST,
            data: restQueryType,
        });

        store.dispatch({
            type: model.StateMutationType.SET_RESULTLOADING,
            data: { key: requestingChartId ? requestingChartId : -1, value: true },
        });

        store.dispatch({
            type: model.StateMutationType.SET_RESULT,
            data: undefined,
        });

        worker.calculateChartData(queryMetadata, restQuery, queryRequestId, metaRequest, restQueryType);
    }
}

//request events from rust, metarequest
export function requestEvents(controller: RequestController) {
    controller.calculateChartData(
        model.RestQueryType.GET_EVENTS,
        model.createRestQuery({
            type: model.RestQueryType.GET_EVENTS,
            data: {},
        }), true);
}

//request pipelines from rust, metarequest
export function requestPipelines(controller: RequestController) {
    controller.calculateChartData(
        model.RestQueryType.GET_PIPELINES,
        model.createRestQuery({
            type: model.RestQueryType.GET_PIPELINES,
            data: {},
        }), true);
}

//request statistics such as number of pipelines, number of cycles, ... from rust, metarequest
export function requestStatistics(controller: RequestController) {
    controller.calculateChartData(
        model.RestQueryType.GET_STATISTICS,
        model.createRestQuery({
            type: model.RestQueryType.GET_STATISTICS,
            data: {},
        }), true); 
}

//request data for chart visualizations
export function requestChartData(controller: RequestController, chartId: number, chartType: model.ChartType, metadata?: { bucksetsize?: string, pipeline?: Array<string>, timeBucketFrame?: [number, number] }) {

    switch (chartType) {

        case model.ChartType.BAR_CHART:

            controller.calculateChartData(
                model.RestQueryType.GET_OPERATOR_FREQUENCY_PER_EVENT,
                model.createRestQuery({
                    type: model.RestQueryType.GET_OPERATOR_FREQUENCY_PER_EVENT,
                    data: { event: store.getState().currentEvent, pipelines: metadata!.pipeline!.join(), timeBucketFrame: metadata!.timeBucketFrame! },
                }), false, chartId);
            break;

        case model.ChartType.SWIM_LANES:

            controller.calculateChartData(

                model.RestQueryType.GET_REL_OP_DISTR_PER_BUCKET,
                model.createRestQuery({
                    type: model.RestQueryType.GET_REL_OP_DISTR_PER_BUCKET,
                    data: { event: store.getState().currentEvent, time: metadata!.bucksetsize! },
                }), false, chartId);
            break;

        case model.ChartType.SWIM_LANES_PIPELINES:

            resetChartDataInStore(chartId);
            controller.calculateChartData(
                model.RestQueryType.GET_REL_OP_DISTR_PER_BUCKET_PER_PIPELINE,
                model.createRestQuery({
                    type: model.RestQueryType.GET_REL_OP_DISTR_PER_BUCKET_PER_PIPELINE,
                    data: { event: store.getState().currentEvent, time: metadata!.bucksetsize! },
                }), false, chartId);
            break;

        case model.ChartType.SWIM_LANES_MULTIPLE_PIPELINES:

            controller.calculateChartData(
                model.RestQueryType.GET_REL_OP_DISTR_PER_BUCKET_PER_MULTIPLE_PIPELINES,
                model.createRestQuery({
                    type: model.RestQueryType.GET_REL_OP_DISTR_PER_BUCKET_PER_MULTIPLE_PIPELINES,
                    data: { event: store.getState().currentEvent, time: metadata!.bucksetsize!, pipelines: metadata!.pipeline!.join(), timeBucketFrame: metadata!.timeBucketFrame! },
                }), false, chartId);
            break;

        case model.ChartType.SWIM_LANES_MULTIPLE_PIPELINES_ABSOLUTE:

            controller.calculateChartData(
                model.RestQueryType.GET_ABS_OP_DISTR_PER_BUCKET_PER_MULTIPLE_PIPELINES,
                model.createRestQuery({
                    type: model.RestQueryType.GET_ABS_OP_DISTR_PER_BUCKET_PER_MULTIPLE_PIPELINES,
                    data: { event: store.getState().currentEvent, time: metadata!.bucksetsize!, pipelines: metadata!.pipeline!.join(), timeBucketFrame: metadata!.timeBucketFrame! },
                }), false, chartId);
            break;

        case model.ChartType.SWIM_LANES_COMBINED_MULTIPLE_PIPELINES:

            controller.calculateChartData(
                model.RestQueryType.GET_REL_OP_DISTR_PER_BUCKET_PER_MULTIPLE_PIPELINES_COMBINED_EVENTS,
                model.createRestQuery({
                    type: model.RestQueryType.GET_REL_OP_DISTR_PER_BUCKET_PER_MULTIPLE_PIPELINES_COMBINED_EVENTS,
                    data: { event1: store.getState().events![0], event2: store.getState().currentEvent, time: metadata!.bucksetsize!, pipelines: metadata!.pipeline!.join(), timeBucketFrame: metadata!.timeBucketFrame! },
                }), false, chartId);
            break;

        case model.ChartType.DONUT_CHART:

            controller.calculateChartData(
                model.RestQueryType.GET_PIPELINE_COUNT,
                model.createRestQuery({
                    type: model.RestQueryType.GET_PIPELINE_COUNT,
                    data: { event: store.getState().currentEvent, timeBucketFrame: metadata!.timeBucketFrame! },
                }), false, chartId);
            break;

        case model.ChartType.BAR_CHART_ACTIVITY_HISTOGRAM:

            controller.calculateChartData(
                model.RestQueryType.GET_EVENT_OCCURRENCES_PER_TIME_UNIT,
                model.createRestQuery({
                    type: model.RestQueryType.GET_EVENT_OCCURRENCES_PER_TIME_UNIT,
                    data: { event: store.getState().currentEvent, time: "10" },
                }), false, chartId);
            break;

    }

}


export function resetChartDataInStore(chartId: number) {

    let chartData = store.getState().chartData;
    delete chartData[chartId];
    let newChartData: model.ChartDataKeyValue = { ...chartData }

    store.dispatch({
        type: model.StateMutationType.SET_CHARTDATA,
        data: newChartData,
    });
    store.dispatch({
        type: model.StateMutationType.SET_MULTIPLECHARTDATALENGTH,
        data: -1,
    });

}
