import * as ArrowTable from "../../node_modules/apache-arrow/table";
import * as model from "../model";
import { store, appContext } from '../app_config';
import * as RequestController from "./request_controller";


export function setCsvReadingFinished() {

    store.dispatch({
        type: model.StateMutationType.SET_CSVPARSINGFINISHED,
        data: true,
    });

    RequestController.requestMetadata(appContext.controller);
}

export function storeQueryPlan(queryPlanJson: object) {

    if (queryPlanJson) {
        store.dispatch({
            type: model.StateMutationType.SET_QUERYPLAN,
            data: queryPlanJson,
        });
    }
}

export function storeResultFromRust(requestId: number, result: ArrowTable.Table<any>, metaRequest: boolean, restQueryType: model.RestQueryType) {

    //store result of current request in redux store result variable 
    const resultObject: model.Result = model.createResultObject(requestId, result);

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
function storeMetaDataFromRust(restQueryType: model.RestQueryType) {

    switch (restQueryType) {

        case model.RestQueryType.GET_EVENTS:
            const events = store.getState().result?.resultTable.getColumn('ev_name').toArray();
            store.dispatch({
                type: model.StateMutationType.SET_EVENTS,
                data: events,
            });
            store.dispatch({
                type: model.StateMutationType.SET_CURRENTEVENT,
                data: events[0],
            });
            if (events.length > 1) {
                events.length > store.dispatch({
                    type: model.StateMutationType.SET_CURRENTMULTIPLEEVENT,
                    data: [events[0], events[1]],
                });
            }
            break;

        case model.RestQueryType.GET_PIPELINES:
            const pipelines = store.getState().result?.resultTable.getColumn('pipeline').toArray();
            store.dispatch({
                type: model.StateMutationType.SET_PIPELINES,
                data: pipelines,
            });
            break;

        case model.RestQueryType.GET_OPERATORS:
            const operators = store.getState().result?.resultTable.getColumn('operator').toArray();
            store.dispatch({
                type: model.StateMutationType.SET_OPERATORS,
                data: operators,
            });
            break;

        case model.RestQueryType.GET_STATISTICS:
            const numberSamplesKpi: model.IKpiData = { id: "noSamples", title: "Total Samples Recorded", value: store.getState().result?.resultTable.getColumnAt(0)!.toArray() };
            const numberPipelinesKpi: model.IKpiData = { id: "noPipelines", title: "Number of Pipelines", value: store.getState().result?.resultTable.getColumnAt(1)!.toArray() };
            const numberOperatorsKpi: model.IKpiData = { id: "noOperators", title: "Number of Operators", value: store.getState().result?.resultTable.getColumnAt(2)!.toArray() };
            const executionTimeKpi: model.IKpiData = { id: "execTime", title: "Query Execution Time", value: store.getState().result?.resultTable.getColumnAt(3)!.toArray() };
            const errorRateKpi: model.IKpiData = { id: "errRate", title: "Sample Error Rate", value: store.getState().result?.resultTable.getColumnAt(4)!.toArray() };
            const kpis = new Array<model.IKpiData>(numberSamplesKpi, numberPipelinesKpi, numberOperatorsKpi, executionTimeKpi, errorRateKpi);

            store.dispatch({
                type: model.StateMutationType.SET_KPIS,
                data: kpis,
            });
            break;
    }

    store.dispatch({
        type: model.StateMutationType.SET_RESULTLOADING,
        data: { key: -1, value: false },
    });

}

//store data arriving from rust that were caused for visualizations in a collection for chart data in redux store
function storeChartDataFromRust(requestId: number, resultObject: model.Result, requestType: model.RestQueryType) {

    //console.log(resultObject.resultTable.getColumn('operator'));

    let chartDataElem: model.ChartDataObject | undefined;
    let chartDataCollection: model.ChartDataKeyValue = store.getState().chartData;
    let setResultLoading = false;

    switch (requestType) {

        case model.RestQueryType.GET_OPERATOR_FREQUENCY_PER_EVENT:

            chartDataElem = model.createChartDataObject(
                requestId,
                {
                    chartType: model.ChartType.BAR_CHART,
                    data: {
                        operators: resultObject.resultTable.getColumn('operator').toArray(),
                        frequency: resultObject.resultTable.getColumn('count').toArray(),
                    }
                });
            setResultLoading = true;
            break;

        case model.RestQueryType.GET_REL_OP_DISTR_PER_BUCKET:

            chartDataElem = model.createChartDataObject(
                requestId,
                {
                    chartType: model.ChartType.SWIM_LANES,
                    data: {
                        buckets: resultObject.resultTable.getColumn('bucket').toArray(),
                        operators: resultObject.resultTable.getColumn('operator').toArray(),
                        frequency: resultObject.resultTable.getColumn('relfreq').toArray(),
                    }
                });
            setResultLoading = true;
            break;

        case model.RestQueryType.GET_REL_OP_DISTR_PER_BUCKET_PER_PIPELINE:

            let dataArray: Array<model.ISwimlanesData> = (store.getState().chartData[requestId] as model.ChartDataObject) ? (store.getState().chartData[requestId] as model.ChartDataObject).chartData.data as model.ISwimlanesData[] : new Array<model.ISwimlanesData>();
            const data: model.ISwimlanesData = {
                buckets: resultObject.resultTable.getColumn('bucket').toArray(),
                operators: resultObject.resultTable.getColumn('operator').toArray(),
                frequency: resultObject.resultTable.getColumn('relfreq').toArray(),
            }
            dataArray.push(data);

            chartDataElem = model.createChartDataObject(
                requestId,
                {
                    chartType: model.ChartType.SWIM_LANES_PIPELINES,
                    data: dataArray,
                });
            setResultLoading = true;
            break;

        case model.RestQueryType.GET_REL_OP_DISTR_PER_BUCKET_PER_MULTIPLE_PIPELINES:

            chartDataElem = model.createChartDataObject(
                requestId,
                {
                    chartType: model.ChartType.SWIM_LANES_MULTIPLE_PIPELINES,
                    data: {
                        buckets: resultObject.resultTable.getColumn('bucket').toArray(),
                        operators: resultObject.resultTable.getColumn('operator').toArray(),
                        frequency: resultObject.resultTable.getColumn('relfreq').toArray(),
                    }
                });
            setResultLoading = true;
            break;

        case model.RestQueryType.GET_ABS_OP_DISTR_PER_BUCKET_PER_MULTIPLE_PIPELINES:

            chartDataElem = model.createChartDataObject(
                requestId,
                {
                    chartType: model.ChartType.SWIM_LANES_MULTIPLE_PIPELINES_ABSOLUTE,
                    data: {
                        buckets: resultObject.resultTable.getColumn('bucket').toArray(),
                        operators: resultObject.resultTable.getColumn('operator').toArray(),
                        frequency: resultObject.resultTable.getColumn('absfreq').toArray(),
                    }
                });
            setResultLoading = true;
            break;

        case model.RestQueryType.GET_REL_OP_DISTR_PER_BUCKET_PER_MULTIPLE_PIPELINES_COMBINED_EVENTS:

            chartDataElem = model.createChartDataObject(
                requestId,
                {
                    chartType: model.ChartType.SWIM_LANES_COMBINED_MULTIPLE_PIPELINES,
                    data: {
                        buckets: resultObject.resultTable.getColumn('bucket').toArray(),
                        operators: resultObject.resultTable.getColumn('operator').toArray(),
                        frequency: resultObject.resultTable.getColumn('relfreq').toArray(),
                        bucketsNeg: resultObject.resultTable.getColumn('bucketNEG').toArray(),
                        operatorsNeg: resultObject.resultTable.getColumn('operatorNEG').toArray(),
                        frequencyNeg: resultObject.resultTable.getColumn('relfreqNEG').toArray(),
                    }
                });
            setResultLoading = true;
            break;

        case model.RestQueryType.GET_ABS_OP_DISTR_PER_BUCKET_PER_MULTIPLE_PIPELINES_COMBINED_EVENTS:

            chartDataElem = model.createChartDataObject(
                requestId,
                {
                    chartType: model.ChartType.SWIM_LANES_COMBINED_MULTIPLE_PIPELINES_ABSOLUTE,
                    data: {
                        buckets: resultObject.resultTable.getColumn('bucket').toArray(),
                        operators: resultObject.resultTable.getColumn('operator').toArray(),
                        frequency: resultObject.resultTable.getColumn('absfreq').toArray(),
                        bucketsNeg: resultObject.resultTable.getColumn('bucketNEG').toArray(),
                        operatorsNeg: resultObject.resultTable.getColumn('operatorNEG').toArray(),
                        frequencyNeg: resultObject.resultTable.getColumn('absfreqNEG').toArray(),
                    }
                });
            setResultLoading = true;
            break;

        case model.RestQueryType.GET_PIPELINE_COUNT:

            chartDataElem = model.createChartDataObject(
                requestId,
                {
                    chartType: model.ChartType.DONUT_CHART,
                    data: {
                        pipeline: resultObject.resultTable.getColumn('pipeline').toArray(),
                        count: resultObject.resultTable.getColumn('count').toArray(),
                    }
                });
            setResultLoading = true;
            break;

        case model.RestQueryType.GET_EVENT_OCCURRENCES_PER_TIME_UNIT:

            chartDataElem = model.createChartDataObject(
                requestId,
                {
                    chartType: model.ChartType.BAR_CHART_ACTIVITY_HISTOGRAM,
                    data: {
                        timeBucket: resultObject.resultTable.getColumn('bucket').toArray(),
                        occurrences: resultObject.resultTable.getColumn('absfreq').toArray(),
                    }
                });
            setResultLoading = true;
            break;

        case model.RestQueryType.GET_PIPELINE_COUNT_WITH_OPERATOR_OCCURENCES:

            chartDataElem = model.createChartDataObject(
                requestId,
                {
                    chartType: model.ChartType.SUNBURST_CHART,
                    data: {
                        operator: resultObject.resultTable.getColumn('operator').toArray(),
                        pipeline: resultObject.resultTable.getColumn('pipeline').toArray(),
                        opOccurrences: resultObject.resultTable.getColumn('opcount').toArray(),
                        pipeOccurrences: resultObject.resultTable.getColumn('pipecount').toArray(),
                    }
                });
            setResultLoading = true;
            break;

        case model.RestQueryType.GET_MEMORY_ACCESSES_PER_TIME_BUCKET_PER_EVENT:

            //let chartData: model.IMemoryAccessHeatmapChartData = store.getState().chartData[requestId] ? (store.getState().chartData[requestId] as model.ChartDataObject).chartData.data as model.IMemoryAccessHeatmapChartData : { domain: {} as model.IMemoryAccessHeatmapChartDomainData, heatmapsData: [] };
            let chartData: model.IMemoryAccessHeatmapChartData = store.getState().chartData[requestId] ? (store.getState().chartData[requestId] as model.ChartDataObject).chartData.data as model.IMemoryAccessHeatmapChartData : {domain: {} as model.IMemoryAccessHeatmapChartDomainData, heatmapsData: []};

            //console.log(chartData);
            if (resultObject.resultTable.schema.fields.length === 7) {
                //domain info received
                const domainData: model.IMemoryAccessHeatmapChartDomainData = {
                    memoryDomain: {
                        max: resultObject.resultTable.getColumn('max_mem').data.values[0],
                        min: resultObject.resultTable.getColumn('min_mem').data.values[0],
                    },
                    timeDomain: {
                        max: resultObject.resultTable.getColumn('max_time').data.values[0],
                        min: resultObject.resultTable.getColumn('min_time').data.values[0],
                    },
                    frequencyDomain: {
                        max: resultObject.resultTable.getColumn('max_freq').data.values[0],
                        min: resultObject.resultTable.getColumn('min_freq').data.values[0],
                    },
                    numberOperators: resultObject.resultTable.getColumn('num_op').data.values[0]
                }
                chartData = {
                    ...chartData,
                    domain: domainData,
                }

            } else if (resultObject.resultTable.schema.fields.length === 4) {
                //single heatmap chart data received
                const singleChartData: model.IMemoryAccessHeatmapChartSingleData = {
                    operator: resultObject.resultTable.getColumn('operator').toArray(),
                    buckets: resultObject.resultTable.getColumn('bucket').toArray(),
                    memoryAdress: resultObject.resultTable.getColumn('mem').toArray(),
                    occurrences: resultObject.resultTable.getColumn('freq').toArray(),
                }
                chartData = {
                    ...chartData,
                    heatmapsData: chartData!.heatmapsData.concat(singleChartData),
                }
                console.log(chartData);
                if (chartData.heatmapsData.length === chartData.domain.numberOperators) {
                    // set result loading to true only if data for all operators arrived
                    setResultLoading = true;
                }
            }

            chartDataElem = model.createChartDataObject(
                requestId,
                {
                    chartType: model.ChartType.MEMORY_ACCESS_HEATMAP_CHART,
                    data: chartData,
                });
            break;
    }

    chartDataCollection[requestId] = chartDataElem!;
    store.dispatch({
        type: model.StateMutationType.SET_CHARTDATA,
        data: chartDataCollection,
    });

    if (setResultLoading) {
        store.dispatch({
            type: model.StateMutationType.SET_RESULTLOADING,
            data: { key: requestId, value: false },
        });
    }

}

