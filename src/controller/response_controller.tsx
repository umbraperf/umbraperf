import * as ArrowTable from "../../node_modules/apache-arrow/table";
import * as model from "../model";
import { store, appContext } from '../app_config';
import * as RequestController from "./request_controller";
import _ from "lodash";


export function setCsvReadingFinished() {

    store.dispatch({
        type: model.StateMutationType.SET_CSV_PARSING_FINISHED,
        data: true,
    });
    store.dispatch({
        type: model.StateMutationType.SET_FILE_LOADING,
        data: false,
    });

    RequestController.requestMetadata(appContext.controller);
}



export function storeResultFromRust(requestId: number, rustResult: ArrowTable.Table<any>, metaRequest: boolean, restQueryType: model.BackendQueryType, queryPlan?: object) {

    //store result of current request in redux store result variable 
    const resultObject: model.IResult = model.createResultObject(requestId, rustResult, queryPlan);

    store.dispatch({
        type: model.StateMutationType.SET_RESULT,
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

//extract events, statistics and pipelines from result table, store them to app state, set current event and current pipelines
function storeMetaDataFromRust(restQueryType: model.BackendQueryType) {

    switch (restQueryType) {

        case model.BackendQueryType.GET_EVENTS:
            const events = store.getState().result?.rustResultTable.getColumn('ev_name').toArray();
            store.dispatch({
                type: model.StateMutationType.SET_EVENTS,
                data: events,
            });
            store.dispatch({
                type: model.StateMutationType.SET_CURRENT_EVENT,
                data: events[0],
            });
            if (events.length > 1) {
                events.length > store.dispatch({
                    type: model.StateMutationType.SET_CURRENT_MULTIPLE_EVENT,
                    data: [events[0], events[1]],
                });
            }
            break;

        case model.BackendQueryType.GET_PIPELINES:
            const pipelines = store.getState().result?.rustResultTable.getColumn('pipeline').toArray();
            store.dispatch({
                type: model.StateMutationType.SET_PIPELINES,
                data: pipelines,
            });
            break;

        case model.BackendQueryType.GET_OPERATORS:

            const operatorsId = store.getState().result?.rustResultTable.getColumn('operator').toArray();
            const createOperatorsGroupNames = () => {
                return operatorsId.map((elem: string) => elem.replace(/\d+/g, ''));
            }

            const operators: model.IOperatorsData = {
                operatorsId,
                operatorsGroup: createOperatorsGroupNames(),
                operatorsNice: store.getState().result?.rustResultTable.getColumn('op_ext').toArray(),
            }
            model.createColorScales(operators.operatorsId, operators.operatorsGroup, 0.3);

            store.dispatch({
                type: model.StateMutationType.SET_OPERATORS,
                data: operators,
            });
            break;

        case model.BackendQueryType.GET_STATISTICS:
            const numberSamplesKpi: model.IKpiData = { id: "noSamples", title: "Total Samples Recorded", value: store.getState().result?.rustResultTable.getColumnAt(0)!.toArray() };
            const numberPipelinesKpi: model.IKpiData = { id: "noPipelines", title: "Number of Pipelines", value: store.getState().result?.rustResultTable.getColumnAt(1)!.toArray() };
            const numberOperatorsKpi: model.IKpiData = { id: "noOperators", title: "Number of Operators", value: store.getState().result?.rustResultTable.getColumnAt(2)!.toArray() };
            const executionTimeKpi: model.IKpiData = { id: "execTime", title: "Query Execution Time", value: store.getState().result?.rustResultTable.getColumnAt(3)!.toArray() };
            const errorRateKpi: model.IKpiData = { id: "errRate", title: "Sample Error Rate", value: store.getState().result?.rustResultTable.getColumnAt(4)!.toArray() };
            const kpis = new Array<model.IKpiData>(numberSamplesKpi, numberPipelinesKpi, numberOperatorsKpi, executionTimeKpi, errorRateKpi);

            store.dispatch({
                type: model.StateMutationType.SET_KPIS,
                data: kpis,
            });
            break;

        case model.BackendQueryType.GET_OPERATORS_ACTIVE_IN_TIMEFRAME_PIPELINE:
            const operatorsTimeframe = store.getState().result?.rustResultTable.getColumn('operator').toArray();
            console.log(operatorsTimeframe);
            store.dispatch({
                type: model.StateMutationType.SET_CURRENT_OPERATOR_ACTIVE_TIMEFRAME_PIPELINE,
                data: operatorsTimeframe,
            });
            break;
    }

    store.dispatch({
        type: model.StateMutationType.SET_RESULT_LOADING,
        data: { key: -1, value: false },
    });

}

//store data arriving from rust that were caused for visualizations in a collection for chart data in redux store
function storeChartDataFromRust(requestId: number, resultObject: model.IResult, requestType: model.BackendQueryType) {

    let chartDataElem: model.IChartDataObject | undefined;
    let chartDataCollection: model.IChartDataKeyValue = store.getState().chartData;
    let toggleResultLoadingFlag = false;

    switch (requestType) {

        case model.BackendQueryType.GET_OPERATOR_FREQUENCY_PER_EVENT:

            chartDataElem = model.createChartDataObject(
                requestId,
                {
                    chartType: model.ChartType.BAR_CHART,
                    data: {
                        operators: resultObject.rustResultTable.getColumn('operator').toArray(),
                        frequency: resultObject.rustResultTable.getColumn('count').toArray(),
                    }
                });
            toggleResultLoadingFlag = true;
            break;

        case model.BackendQueryType.GET_REL_OP_DISTR_PER_BUCKET_PER_MULTIPLE_PIPELINES:

            chartDataElem = model.createChartDataObject(
                requestId,
                {
                    chartType: model.ChartType.SWIM_LANES_MULTIPLE_PIPELINES,
                    data: {
                        buckets: resultObject.rustResultTable.getColumn('bucket').toArray(),
                        operatorsNice: resultObject.rustResultTable.getColumn('op_ext').toArray(),
                        operators: resultObject.rustResultTable.getColumn('operator').toArray(),
                        frequency: resultObject.rustResultTable.getColumn('relfreq').toArray(),
                    }
                });
            toggleResultLoadingFlag = true;
            break;

        case model.BackendQueryType.GET_ABS_OP_DISTR_PER_BUCKET_PER_MULTIPLE_PIPELINES:

            chartDataElem = model.createChartDataObject(
                requestId,
                {
                    chartType: model.ChartType.SWIM_LANES_MULTIPLE_PIPELINES_ABSOLUTE,
                    data: {
                        buckets: resultObject.rustResultTable.getColumn('bucket').toArray(),
                        operatorsNice: resultObject.rustResultTable.getColumn('op_ext').toArray(),
                        operators: resultObject.rustResultTable.getColumn('operator').toArray(),
                        frequency: resultObject.rustResultTable.getColumn('absfreq').toArray(),
                    }
                });
            toggleResultLoadingFlag = true;
            break;

        case model.BackendQueryType.GET_REL_OP_DISTR_PER_BUCKET_PER_MULTIPLE_PIPELINES_COMBINED_EVENTS:

            chartDataElem = model.createChartDataObject(
                requestId,
                {
                    chartType: model.ChartType.SWIM_LANES_COMBINED_MULTIPLE_PIPELINES,
                    data: {
                        buckets: resultObject.rustResultTable.getColumn('bucket').toArray(),
                        operators: resultObject.rustResultTable.getColumn('operator').toArray(),
                        operatorsNice: resultObject.rustResultTable.getColumn('op_ext').toArray(), 
                        frequency: resultObject.rustResultTable.getColumn('relfreq').toArray(),
                        bucketsNeg: resultObject.rustResultTable.getColumn('bucketNEG').toArray(),
                        operatorsNeg: resultObject.rustResultTable.getColumn('operatorNEG').toArray(),
                        operatorsNiceNeg: resultObject.rustResultTable.getColumn('op_extNEG').toArray(), 
                        frequencyNeg: resultObject.rustResultTable.getColumn('relfreqNEG').toArray(),
                    }
                });
            toggleResultLoadingFlag = true;
            break;

        case model.BackendQueryType.GET_ABS_OP_DISTR_PER_BUCKET_PER_MULTIPLE_PIPELINES_COMBINED_EVENTS:

            chartDataElem = model.createChartDataObject(
                requestId,
                {
                    chartType: model.ChartType.SWIM_LANES_COMBINED_MULTIPLE_PIPELINES_ABSOLUTE,
                    data: {
                        buckets: resultObject.rustResultTable.getColumn('bucket').toArray(),
                        operators: resultObject.rustResultTable.getColumn('operator').toArray(),
                        operatorsNice: resultObject.rustResultTable.getColumn('op_ext').toArray(), 
                        frequency: resultObject.rustResultTable.getColumn('absfreq').toArray(),
                        bucketsNeg: resultObject.rustResultTable.getColumn('bucketNEG').toArray(),
                        operatorsNeg: resultObject.rustResultTable.getColumn('operatorNEG').toArray(),
                        operatorsNiceNeg: resultObject.rustResultTable.getColumn('op_extNEG').toArray(), 
                        frequencyNeg: resultObject.rustResultTable.getColumn('absfreqNEG').toArray(),
                    }
                });
            toggleResultLoadingFlag = true;
            break;

        case model.BackendQueryType.GET_EVENT_OCCURRENCES_PER_TIME_UNIT:

            chartDataElem = model.createChartDataObject(
                requestId,
                {
                    chartType: model.ChartType.BAR_CHART_ACTIVITY_HISTOGRAM,
                    data: {
                        timeBucket: resultObject.rustResultTable.getColumn('bucket').toArray(),
                        occurrences: resultObject.rustResultTable.getColumn('absfreq').toArray(),
                    }
                });
            toggleResultLoadingFlag = true;
            break;

        case model.BackendQueryType.GET_PIPELINE_COUNT_WITH_OPERATOR_OCCURENCES:

            chartDataElem = model.createChartDataObject(
                requestId,
                {
                    chartType: model.ChartType.SUNBURST_CHART,
                    data: {
                        operator: resultObject.rustResultTable.getColumn('operator').toArray(),
                        pipeline: resultObject.rustResultTable.getColumn('pipeline').toArray(),
                        opOccurrences: resultObject.rustResultTable.getColumn('opcount').toArray(),
                        pipeOccurrences: resultObject.rustResultTable.getColumn('pipecount').toArray(),
                    }
                });
            toggleResultLoadingFlag = true;
            break;

        case model.BackendQueryType.GET_MEMORY_ACCESSES_PER_TIME_BUCKET_PER_EVENT:

            //let chartData: model.IMemoryAccessHeatmapChartData = store.getState().chartData[requestId] ? (store.getState().chartData[requestId] as model.ChartDataObject).chartData.data as model.IMemoryAccessHeatmapChartData : { domain: {} as model.IMemoryAccessHeatmapChartDomainData, heatmapsData: [] };
            let chartData: model.IMemoryAccessHeatmapChartData = store.getState().chartData[requestId] ? (store.getState().chartData[requestId] as model.IChartDataObject).chartData.data as model.IMemoryAccessHeatmapChartData : { domain: {} as model.IMemoryAccessHeatmapChartDomainData, heatmapsData: [] };

            if (resultObject.rustResultTable.schema.fields.length === 7) {
                //domain info received
                const domainData: model.IMemoryAccessHeatmapChartDomainData = {
                    memoryDomain: {
                        max: resultObject.rustResultTable.getColumn('max_mem').data.values[0],
                        min: resultObject.rustResultTable.getColumn('min_mem').data.values[0],
                    },
                    timeDomain: {
                        max: resultObject.rustResultTable.getColumn('max_time').data.values[0],
                        min: resultObject.rustResultTable.getColumn('min_time').data.values[0],
                    },
                    frequencyDomain: {
                        max: resultObject.rustResultTable.getColumn('max_freq').data.values[0],
                        min: resultObject.rustResultTable.getColumn('min_freq').data.values[0],
                    },
                    numberOperators: resultObject.rustResultTable.getColumn('num_op').data.values[0]
                }
                chartData = {
                    domain: domainData,
                    heatmapsData: [], //need for reset stored heatmaps array on new data
                }

            } else if (resultObject.rustResultTable.schema.fields.length === 4) {
                //single heatmap chart data received
                const singleChartData: model.IMemoryAccessHeatmapChartSingleData = {
                    operator: resultObject.rustResultTable.getColumn('operator').toArray(),
                    buckets: resultObject.rustResultTable.getColumn('bucket').toArray(),
                    memoryAdress: resultObject.rustResultTable.getColumn('mem').toArray(),
                    occurrences: resultObject.rustResultTable.getColumn('freq').toArray(),
                }
                chartData = {
                    ...chartData,
                    heatmapsData: chartData!.heatmapsData.concat(singleChartData),
                }

                if (chartData.heatmapsData.length === chartData.domain.numberOperators) {
                    // set result loading to true only if data for all operators arrived
                    toggleResultLoadingFlag = true;
                }
            }

            chartDataElem = model.createChartDataObject(
                requestId,
                {
                    chartType: model.ChartType.MEMORY_ACCESS_HEATMAP_CHART,
                    data: chartData,
                });
            break;

        case model.BackendQueryType.GET_GROUPED_UIR_LINES:

            let eventsFrequency: {
                [eventId: number]: Array<number>;
            } = {};
            let eventsRelativeFrequency: {
                [eventId: number]: Array<number>;
            } = {};
            for (let i = 0; i < store.getState().events!.length; i++) {
                const eventId = i + 1;
                eventsFrequency[eventId] = resultObject.rustResultTable.getColumn(`perc${eventId}`).toArray();
                eventsRelativeFrequency[eventId] = resultObject.rustResultTable.getColumn(`rel_perc${eventId}`).toArray();
            }

            chartDataElem = model.createChartDataObject(
                requestId,
                {
                    chartType: model.ChartType.UIR_VIEWER,
                    data: {
                        uirLines: resultObject.rustResultTable.getColumn('scrline').toArray(),
                        eventsFrequency,
                        eventsRelativeFrequency,
                        operators: resultObject.rustResultTable.getColumn('op').toArray(),
                        pipelines: resultObject.rustResultTable.getColumn('pipe').toArray(),
                        isFunction: resultObject.rustResultTable.getColumn('func_flag').toArray(),
                    }
                });
            toggleResultLoadingFlag = true;
            break;

        case model.BackendQueryType.GET_QUERYPLAN_DATA:
            let queryplanDataElem: model.IQueryPlanData = store.getState().chartData[requestId] ? (store.getState().chartData[requestId] as model.IChartDataObject).chartData.data as model.IQueryPlanData : { queryplanData: {}, nodeTooltipData: {} as model.IQueryPlanNodeTooltipData };

            if (resultObject.queryPlan) {
                queryplanDataElem.queryplanData = resultObject.queryPlan;
            } else if (resultObject.rustResultTable.length !== 0) {
                const nodeTooltipData: model.IQueryPlanNodeTooltipData = {
                    uirLines: resultObject.rustResultTable.getColumn('scrline').toArray(),
                    eventOccurrences: resultObject.rustResultTable.getColumn('perc').toArray(),
                    operators: resultObject.rustResultTable.getColumn('op').toArray(),
                    uirLineNumbers: resultObject.rustResultTable.getColumn('srcline_num').toArray(),
                    operatorTotalFrequency: resultObject.rustResultTable.getColumn('total').toArray(),
                }
                queryplanDataElem.nodeTooltipData = nodeTooltipData;
            }

            chartDataElem = model.createChartDataObject(
                requestId,
                {
                    chartType: model.ChartType.QUERY_PLAN,
                    data: {
                        ...queryplanDataElem,
                    }
                });

            if (!_.isEmpty(queryplanDataElem.queryplanData) && !_.isEmpty(queryplanDataElem.nodeTooltipData)) {
                toggleResultLoadingFlag = true;
            }
            break;
    }

    chartDataCollection[requestId] = chartDataElem!;
    store.dispatch({
        type: model.StateMutationType.SET_CHART_DATA,
        data: chartDataCollection,
    });

    if (toggleResultLoadingFlag) {
        store.dispatch({
            type: model.StateMutationType.SET_RESULT_LOADING,
            data: { key: requestId, value: false },
        });
    }

}

