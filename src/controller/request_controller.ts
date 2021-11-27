import * as model from "../model";
import { store } from '../app_config';
import { WorkerAPI } from "../worker_api";


const worker = new WorkerAPI();

export class RequestController {

    public registerFileAtWorker(file: File) {
        worker.registerFile(file);
    }


    public calculateChartData(restQueryType: model.BackendQueryType, restQuery: string, metaRequest: boolean, requestingChartId?: number, chartType?: model.ChartType) {

        const queryRequestId = requestingChartId === undefined ? -1 : requestingChartId;

        store.dispatch({
            type: model.StateMutationType.SET_CURRENTREQUEST,
            data: restQueryType,
        });

        if (!metaRequest && chartType) {
            store.dispatch({
                type: model.StateMutationType.SET_LOADINGCHARTREADABLENAME,
                data: chartType,
            });
        }

        store.dispatch({
            type: model.StateMutationType.SET_RESULTLOADING,
            data: { key: requestingChartId ? requestingChartId : -1, value: true },
        });

        store.dispatch({
            type: model.StateMutationType.SET_RESULT,
            data: undefined,
        });

        worker.calculateChartData(restQuery, queryRequestId, metaRequest, restQueryType);
    }
}

//request metadata without statistics
export function requestMetadata(controller: RequestController) {
    requestEvents(controller);
    requestPipelines(controller);
    requestOperators(controller);
}

//request events from rust, metarequest
export function requestEvents(controller: RequestController) {
    controller.calculateChartData(
        model.BackendQueryType.GET_EVENTS,
        model.createBackendQuery({
            type: model.BackendQueryType.GET_EVENTS,
            data: {},
        }), true);
}

//request pipelines from rust, metarequest
export function requestPipelines(controller: RequestController) {
    controller.calculateChartData(
        model.BackendQueryType.GET_PIPELINES,
        model.createBackendQuery({
            type: model.BackendQueryType.GET_PIPELINES,
            data: {},
        }), true);
}

//request operators from rust, metarequest
export function requestOperators(controller: RequestController) {
    controller.calculateChartData(
        model.BackendQueryType.GET_OPERATORS,
        model.createBackendQuery({
            type: model.BackendQueryType.GET_OPERATORS,
            data: { event: "Default" }, //for ordered operators array always use order of first event loaded to stay consitet.
        }), true);
}

//request statistics such as number of pipelines, number of cycles, ... from rust, metarequest, set old statistics to empty to show spinner in component
export function requestStatistics(controller: RequestController) {
    store.dispatch({
        type: model.StateMutationType.SET_KPIS,
        data: [],
    });

    controller.calculateChartData(
        model.BackendQueryType.GET_STATISTICS,
        model.createBackendQuery({
            type: model.BackendQueryType.GET_STATISTICS,
            data: { event: store.getState().currentEvent, pipelines: store.getState().currentPipeline, timeBucketFrame: store.getState().currentTimeBucketSelectionTuple },
        }), true);
}

//request data for chart visualizations
export function requestChartData(controller: RequestController, chartId: number, chartType: model.ChartType) {

    let restQuery: string = "";
    let restQueryType: model.BackendQueryType = model.BackendQueryType.other;

    switch (chartType) {

        case model.ChartType.BAR_CHART:
            restQueryType = model.BackendQueryType.GET_OPERATOR_FREQUENCY_PER_EVENT;
            restQuery = model.createBackendQuery({
                type: restQueryType,
                data: { event: store.getState().currentEvent, pipelines: store.getState().currentPipeline, timeBucketFrame: store.getState().currentTimeBucketSelectionTuple },
            });
            break;

        // case model.ChartType.SWIM_LANES:
        //     restQueryType = model.RestQueryType.GET_REL_OP_DISTR_PER_BUCKET;
        //     restQuery = model.createRestQuery({
        //         type: restQueryType,
        //         data: { event: store.getState().currentEvent, bucketSize: store.getState().currentBucketSize },
        //     });
        //     break;

        // case model.ChartType.SWIM_LANES_PIPELINES:
        //     restQueryType = model.RestQueryType.GET_REL_OP_DISTR_PER_BUCKET_PER_PIPELINE;
        //     restQuery = model.createRestQuery({
        //         type: restQueryType,
        //         data: { event: store.getState().currentEvent, bucketSize: store.getState().currentBucketSize },
        //     });
        //     break;

        case model.ChartType.SWIM_LANES_MULTIPLE_PIPELINES:
            restQueryType = model.BackendQueryType.GET_REL_OP_DISTR_PER_BUCKET_PER_MULTIPLE_PIPELINES;
            restQuery = model.createBackendQuery({
                type: restQueryType,
                data: { event: store.getState().currentEvent, bucketSize: store.getState().currentBucketSize, pipelines: store.getState().currentPipeline, operators: store.getState().currentOperator, timeBucketFrame: store.getState().currentTimeBucketSelectionTuple },
            });
            break;

        case model.ChartType.SWIM_LANES_MULTIPLE_PIPELINES_ABSOLUTE:
            restQueryType = model.BackendQueryType.GET_ABS_OP_DISTR_PER_BUCKET_PER_MULTIPLE_PIPELINES;
            restQuery = model.createBackendQuery({
                type: restQueryType,
                data: { event: store.getState().currentEvent, bucketSize: store.getState().currentBucketSize, pipelines: store.getState().currentPipeline, operators: store.getState().currentOperator, timeBucketFrame: store.getState().currentTimeBucketSelectionTuple },
            });
            break;

        case model.ChartType.SWIM_LANES_COMBINED_MULTIPLE_PIPELINES:
            restQueryType = model.BackendQueryType.GET_REL_OP_DISTR_PER_BUCKET_PER_MULTIPLE_PIPELINES_COMBINED_EVENTS;
            restQuery = model.createBackendQuery({
                type: restQueryType,
                data: { event1: store.getState().currentMultipleEvent[1], event0: store.getState().currentMultipleEvent[0], bucketSize: store.getState().currentBucketSize, pipelines: store.getState().currentPipeline, operators: store.getState().currentOperator, timeBucketFrame: store.getState().currentTimeBucketSelectionTuple },
            });
            break;

        case model.ChartType.SWIM_LANES_COMBINED_MULTIPLE_PIPELINES_ABSOLUTE:
            restQueryType = model.BackendQueryType.GET_ABS_OP_DISTR_PER_BUCKET_PER_MULTIPLE_PIPELINES_COMBINED_EVENTS;
            restQuery = model.createBackendQuery({
                type: model.BackendQueryType.GET_ABS_OP_DISTR_PER_BUCKET_PER_MULTIPLE_PIPELINES_COMBINED_EVENTS,
                data: { event1: store.getState().currentMultipleEvent[1], event0: store.getState().currentMultipleEvent[0], bucketSize: store.getState().currentBucketSize, pipelines: store.getState().currentPipeline, operators: store.getState().currentOperator, timeBucketFrame: store.getState().currentTimeBucketSelectionTuple },
            });
            break;

        // case model.ChartType.DONUT_CHART:
        //     restQueryType = model.RestQueryType.GET_PIPELINE_COUNT;
        //     restQuery = model.createRestQuery({
        //         type: restQueryType,
        //         data: { event: store.getState().currentEvent, timeBucketFrame: store.getState().currentTimeBucketSelectionTuple },
        //     });
        //     break;

        case model.ChartType.BAR_CHART_ACTIVITY_HISTOGRAM:
            restQueryType = model.BackendQueryType.GET_EVENT_OCCURRENCES_PER_TIME_UNIT;
            restQuery = model.createBackendQuery({
                type: restQueryType,
                data: { event: store.getState().currentEvent, bucketSize: store.getState().currentBucketSize },
            });
            break;

        case model.ChartType.SUNBURST_CHART:
            restQueryType = model.BackendQueryType.GET_PIPELINE_COUNT_WITH_OPERATOR_OCCURENCES;
            restQuery = model.createBackendQuery({
                type: restQueryType,
                data: { event: store.getState().currentEvent, timeBucketFrame: store.getState().currentTimeBucketSelectionTuple, allPipelines: store.getState().pipelines! },
            });
            break;

        case model.ChartType.MEMORY_ACCESS_HEATMAP_CHART:
            restQueryType = model.BackendQueryType.GET_MEMORY_ACCESSES_PER_TIME_BUCKET_PER_EVENT;
            restQuery = model.createBackendQuery({
                type: restQueryType,
                data: { event: store.getState().currentEvent, bucketSize: store.getState().currentBucketSize, timeBucketFrame: store.getState().currentTimeBucketSelectionTuple, showMemoryAccessesDifferences: store.getState().memoryHeatmapsDifferenceRepresentation },
            });
            break;

        case model.ChartType.UIR_VIEWER:
            restQueryType = model.BackendQueryType.GET_GROUPED_UIR_LINES;
            restQuery = model.createBackendQuery({
                type: restQueryType,
                data: { timeBucketFrame: store.getState().currentTimeBucketSelectionTuple },
            });
            break;

        case model.ChartType.QUERY_PLAN:
            restQueryType = model.BackendQueryType.GET_QUERYPLAN_DATA;
            restQuery = model.createBackendQuery({
                type: restQueryType,
                data: { },
            });
            break;
    }

    controller.calculateChartData(restQueryType, restQuery, false, chartId, chartType);
}


export function resetChartDataInStore(chartId: number) {

    let chartData = store.getState().chartData;
    delete chartData[chartId];
    let newChartData: model.ChartDataKeyValue = { ...chartData }

    store.dispatch({
        type: model.StateMutationType.SET_CHARTDATA,
        data: newChartData,
    });
}
