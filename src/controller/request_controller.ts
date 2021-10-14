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

//request all metadata
export function requestMetadata(controller: RequestController) {
    requestEvents(controller);
    requestPipelines(controller);
    requestOperators(controller);
    requestStatistics(controller);
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

//request operators from rust, metarequest
export function requestOperators(controller: RequestController) {
    controller.calculateChartData(
        model.RestQueryType.GET_OPERATORS,
        model.createRestQuery({
            type: model.RestQueryType.GET_OPERATORS,
            data: { event: "Default" }, //for ordered operators array always use order of first event loaded to stay consitet.
        }), true);
}

//request statistics such as number of pipelines, number of cycles, ... from rust, metarequest
export function requestStatistics(controller: RequestController) {
    controller.calculateChartData(
        model.RestQueryType.GET_STATISTICS,
        model.createRestQuery({
            type: model.RestQueryType.GET_STATISTICS,
            data: { event: store.getState().currentEvent, pipelines: store.getState().currentPipeline, timeBucketFrame: store.getState().currentTimeBucketSelectionTuple },
        }), true);
}

//request data for chart visualizations
export function requestChartData(controller: RequestController, chartId: number, chartType: model.ChartType) {

    switch (chartType) {

        case model.ChartType.BAR_CHART:

            controller.calculateChartData(
                model.RestQueryType.GET_OPERATOR_FREQUENCY_PER_EVENT,
                model.createRestQuery({
                    type: model.RestQueryType.GET_OPERATOR_FREQUENCY_PER_EVENT,
                    data: { event: store.getState().currentEvent, pipelines: store.getState().currentPipeline, timeBucketFrame: store.getState().currentTimeBucketSelectionTuple },
                }), false, chartId);
            break;

        case model.ChartType.SWIM_LANES:

            controller.calculateChartData(

                model.RestQueryType.GET_REL_OP_DISTR_PER_BUCKET,
                model.createRestQuery({
                    type: model.RestQueryType.GET_REL_OP_DISTR_PER_BUCKET,
                    data: { event: store.getState().currentEvent, bucketSize: store.getState().currentBucketSize },
                }), false, chartId);
            break;

        case model.ChartType.SWIM_LANES_PIPELINES:

            resetChartDataInStore(chartId);
            controller.calculateChartData(
                model.RestQueryType.GET_REL_OP_DISTR_PER_BUCKET_PER_PIPELINE,
                model.createRestQuery({
                    type: model.RestQueryType.GET_REL_OP_DISTR_PER_BUCKET_PER_PIPELINE,
                    data: { event: store.getState().currentEvent, bucketSize: store.getState().currentBucketSize },
                }), false, chartId);
            break;

        case model.ChartType.SWIM_LANES_MULTIPLE_PIPELINES:

            controller.calculateChartData(
                model.RestQueryType.GET_REL_OP_DISTR_PER_BUCKET_PER_MULTIPLE_PIPELINES,
                model.createRestQuery({
                    type: model.RestQueryType.GET_REL_OP_DISTR_PER_BUCKET_PER_MULTIPLE_PIPELINES,
                    data: { event: store.getState().currentEvent, bucketSize: store.getState().currentBucketSize, pipelines: store.getState().currentPipeline, operators: store.getState().currentOperator, timeBucketFrame: store.getState().currentTimeBucketSelectionTuple },
                }), false, chartId);
            break;

        case model.ChartType.SWIM_LANES_MULTIPLE_PIPELINES_ABSOLUTE:

            controller.calculateChartData(
                model.RestQueryType.GET_ABS_OP_DISTR_PER_BUCKET_PER_MULTIPLE_PIPELINES,
                model.createRestQuery({
                    type: model.RestQueryType.GET_ABS_OP_DISTR_PER_BUCKET_PER_MULTIPLE_PIPELINES,
                    data: { event: store.getState().currentEvent, bucketSize: store.getState().currentBucketSize, pipelines: store.getState().currentPipeline, operators: store.getState().currentOperator, timeBucketFrame: store.getState().currentTimeBucketSelectionTuple },
                }), false, chartId);
            break;

        case model.ChartType.SWIM_LANES_COMBINED_MULTIPLE_PIPELINES:

            controller.calculateChartData(
                model.RestQueryType.GET_REL_OP_DISTR_PER_BUCKET_PER_MULTIPLE_PIPELINES_COMBINED_EVENTS,
                model.createRestQuery({
                    type: model.RestQueryType.GET_REL_OP_DISTR_PER_BUCKET_PER_MULTIPLE_PIPELINES_COMBINED_EVENTS,
                    data: { event1: store.getState().events![0], event2: store.getState().currentEvent, bucketSize: store.getState().currentBucketSize, pipelines: store.getState().currentPipeline, timeBucketFrame: store.getState().currentTimeBucketSelectionTuple },
                }), false, chartId);
            break;

        case model.ChartType.SWIM_LANES_COMBINED_MULTIPLE_PIPELINES_ABSOLUTE:

            controller.calculateChartData(
                model.RestQueryType.GET_ABS_OP_DISTR_PER_BUCKET_PER_MULTIPLE_PIPELINES_COMBINED_EVENTS,
                model.createRestQuery({
                    type: model.RestQueryType.GET_ABS_OP_DISTR_PER_BUCKET_PER_MULTIPLE_PIPELINES_COMBINED_EVENTS,
                    data: { event1: store.getState().events![0], event2: store.getState().currentEvent, bucketSize: store.getState().currentBucketSize, pipelines: store.getState().currentPipeline, timeBucketFrame: store.getState().currentTimeBucketSelectionTuple },
                }), false, chartId);
            break;

        case model.ChartType.DONUT_CHART:

            //depreciated
            controller.calculateChartData(
                model.RestQueryType.GET_PIPELINE_COUNT,
                model.createRestQuery({
                    type: model.RestQueryType.GET_PIPELINE_COUNT,
                    data: { event: store.getState().currentEvent, timeBucketFrame: store.getState().currentTimeBucketSelectionTuple },
                }), false, chartId);
            break;

        case model.ChartType.BAR_CHART_ACTIVITY_HISTOGRAM:

            controller.calculateChartData(
                model.RestQueryType.GET_EVENT_OCCURRENCES_PER_TIME_UNIT,
                model.createRestQuery({
                    type: model.RestQueryType.GET_EVENT_OCCURRENCES_PER_TIME_UNIT,
                    data: { event: store.getState().currentEvent, bucketSize: 10 },
                }), false, chartId);
            break;

        case model.ChartType.SUNBURST_CHART:

            controller.calculateChartData(
                model.RestQueryType.GET_PIPELINE_COUNT_WITH_OPERATOR_OCCURENCES,
                model.createRestQuery({
                    type: model.RestQueryType.GET_PIPELINE_COUNT_WITH_OPERATOR_OCCURENCES,
                    data: { event: store.getState().currentEvent, timeBucketFrame: store.getState().currentTimeBucketSelectionTuple, allPipelines: store.getState().pipelines! },
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
