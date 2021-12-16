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
            type: model.StateMutationType.SET_CURRENT_REQUEST,
            data: restQueryType,
        });

        if (!metaRequest && chartType) {
            store.dispatch({
                type: model.StateMutationType.SET_LOADING_CHART_READABLE_NAME,
                data: chartType,
            });
        }

        store.dispatch({
            type: model.StateMutationType.SET_RESULT_LOADING,
            data: { key: requestingChartId ? requestingChartId : -1, value: true }, //id -1 if metarequest
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
    requestActiveOperatorsTimeframePipeline(controller);
    requestActivePipelineTimeframe(controller);
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

//request pipelines arry of active pipelines in current selected timeframe
export function requestActivePipelineTimeframe(controller: RequestController) {
    controller.calculateChartData(
        model.BackendQueryType.GET_PIPELINES_ACTIVE_IN_TIMEFRAME,
        model.createBackendQuery({
            type: model.BackendQueryType.GET_PIPELINES_ACTIVE_IN_TIMEFRAME,
            data: { event: store.getState().currentEvent, timeBucketFrame: store.getState().currentTimeBucketSelectionTuple },
        }), true);
}

//request operators arry of active operators in current selected timeframe and pipeline
export function requestActiveOperatorsTimeframePipeline(controller: RequestController) {
    controller.calculateChartData(
        model.BackendQueryType.GET_OPERATORS_ACTIVE_IN_TIMEFRAME_PIPELINE,
        model.createBackendQuery({
            type: model.BackendQueryType.GET_OPERATORS_ACTIVE_IN_TIMEFRAME_PIPELINE,
            data: { event: store.getState().currentEvent, timeBucketFrame: store.getState().currentTimeBucketSelectionTuple, pipelines: store.getState().currentPipeline },
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
                data: { event2: store.getState().currentMultipleEvent[1], event1: store.getState().currentMultipleEvent[0], bucketSize: store.getState().currentBucketSize, pipelines: store.getState().currentPipeline, operators: store.getState().currentOperator, timeBucketFrame: store.getState().currentTimeBucketSelectionTuple },
            });
            break;

        case model.ChartType.SWIM_LANES_COMBINED_MULTIPLE_PIPELINES_ABSOLUTE:
            restQueryType = model.BackendQueryType.GET_ABS_OP_DISTR_PER_BUCKET_PER_MULTIPLE_PIPELINES_COMBINED_EVENTS;
            restQuery = model.createBackendQuery({
                type: model.BackendQueryType.GET_ABS_OP_DISTR_PER_BUCKET_PER_MULTIPLE_PIPELINES_COMBINED_EVENTS,
                data: { event2: store.getState().currentMultipleEvent[1], event1: store.getState().currentMultipleEvent[0], bucketSize: store.getState().currentBucketSize, pipelines: store.getState().currentPipeline, operators: store.getState().currentOperator, timeBucketFrame: store.getState().currentTimeBucketSelectionTuple },
            });
            break;

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
                data: { events: store.getState().events!, timeBucketFrame: store.getState().currentTimeBucketSelectionTuple },
            });
            break;

        case model.ChartType.QUERY_PLAN:
            restQueryType = model.BackendQueryType.GET_QUERYPLAN_TOOLTIP_DATA;
            restQuery = model.createBackendQuery({
                type: restQueryType,
                data: { event: store.getState().currentEvent, timeBucketFrame: store.getState().currentTimeBucketSelectionTuple },
            });
            break;
    }

    controller.calculateChartData(restQueryType, restQuery, false, chartId, chartType);
}


export function resetChartDataInStore(chartId: number) {

    let chartData = store.getState().chartData;
    delete chartData[chartId];
    let newChartData: model.IChartDataKeyValue = { ...chartData }

    store.dispatch({
        type: model.StateMutationType.SET_CHART_DATA,
        data: newChartData,
    });
}
