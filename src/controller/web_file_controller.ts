import * as model from "../model";
import { store } from '../app';
import { WorkerAPI } from "../worker_api";


const worker = new WorkerAPI();

export class WebFileController {

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
            data: {key: requestingChartId ? requestingChartId : -1, value: true},
        });

        store.dispatch({
            type: model.StateMutationType.SET_RESULT,
            data: undefined,
        });

        worker.calculateChartData(queryMetadata, restQuery, queryRequestId, metaRequest, restQueryType);
    }
}

//request events from rust, metarequest
export function requestEvents(controller: WebFileController) {
    controller.calculateChartData(
        model.RestQueryType.GET_EVENTS,
        model.createRestQuery({
            type: model.RestQueryType.GET_EVENTS,
            data: {},
        }), true);
}

//request pipelines from rust, metarequest
export function requestPipelines(controller: WebFileController) {
    controller.calculateChartData(
        model.RestQueryType.GET_PIPELINES,
        model.createRestQuery({
            type: model.RestQueryType.GET_PIPELINES,
            data: {},
        }), true);
}

//request statistics such as number of pipelines, number of cycles, ... from rust, metarequest
export function requestStatistics(controller: WebFileController) {
    //TODO 

}

//request data for chart visualizations
export function requestChartData(controller: WebFileController, chartId: number, chartType: model.ChartType, metadata?: { bucksetsize?: string, pipeline?: string }) {

    switch (chartType) {

        case model.ChartType.BAR_CHART:

            controller.calculateChartData(
                model.RestQueryType.GET_OPERATOR_FREQUENCY_PER_EVENT,
                model.createRestQuery({
                    type: model.RestQueryType.GET_OPERATOR_FREQUENCY_PER_EVENT,
                    data: { event: store.getState().currentEvent, pipelines: metadata!.pipeline! },
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
                    data: { event: store.getState().currentEvent, time: metadata!.bucksetsize!, pipelines: metadata!.pipeline! },
                }), false, chartId);
            break;

        case model.ChartType.DONUT_CHART:

            controller.calculateChartData(
                model.RestQueryType.GET_PIPELINE_COUNT,
                model.createRestQuery({
                    type: model.RestQueryType.GET_PIPELINE_COUNT,
                    data: { event: store.getState().currentEvent },
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
