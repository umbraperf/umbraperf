import * as ArrowTable from "../../node_modules/apache-arrow/table";
import * as model from "../model";
import { store } from '../app';
import * as RequestController from "./request_controller";
import { appContext } from "../app";


export function setCsvReadingFinished() {

    store.dispatch({
        type: model.StateMutationType.SET_CSVPARSINGFINISHED,
        data: true,
    });

    RequestController.requestMetadata(appContext.controller);
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

//extract events and pipelines from result table, store them to app state, set current event and current pipelines
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
            const numberSamplesKpi: model.IKpiData = { title: "Total Samples Recorded", value: store.getState().result?.resultTable.getColumnAt(0)!.toArray() };
            const numberPipelinesKpi: model.IKpiData = { title: "Number of Pipelines", value: store.getState().result?.resultTable.getColumnAt(1)!.toArray() };
            const numberOperatorsKpi: model.IKpiData = { title: "Number of Operators", value: store.getState().result?.resultTable.getColumnAt(2)!.toArray() };
            const executionTimeKpi: model.IKpiData = { title: "Query Execution Time", value: store.getState().result?.resultTable.getColumnAt(3)!.toArray() };
            const errorRateKpi: model.IKpiData = { title: "Sample Error Rate", value: store.getState().result?.resultTable.getColumnAt(4)!.toArray() };
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
    let chartDataElem: model.ChartDataObject | undefined;
    let chartDataCollection: model.ChartDataKeyValue = store.getState().chartData;

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
            break;

        case model.RestQueryType.GET_REL_OP_DISTR_PER_BUCKET_PER_PIPELINE:

            let dataArray: Array<model.ISwimlanesData> = (store.getState().chartData[requestId] as model.ChartDataObject) ? (store.getState().chartData[requestId] as model.ChartDataObject).chartData.data as model.ISwimlanesData[] : new Array<model.ISwimlanesData>();
            const data: model.ISwimlanesData = {
                buckets: resultObject.resultTable.getColumn('bucket').toArray(),
                operators: resultObject.resultTable.getColumn('operator').toArray(),
                frequency: resultObject.resultTable.getColumn('relfreq').toArray(),
            }
            dataArray.push(data);

            let multipleChartDataLength = store.getState().multipleChartDataLength + 1;

            store.dispatch({
                type: model.StateMutationType.SET_MULTIPLECHARTDATALENGTH,
                data: multipleChartDataLength,
            });

            chartDataElem = model.createChartDataObject(
                requestId,
                {
                    chartType: model.ChartType.SWIM_LANES_PIPELINES,
                    data: dataArray,
                });

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
            break;

        case model.RestQueryType.GET_PIPELINE_COUNT_WITH_OPERATOR_OCCURENCES:

            chartDataElem = model.createChartDataObject(
                requestId,
                {
                    chartType: model.ChartType.SUNBURST_CHART,
                    data: {
                        operator: resultObject.resultTable.getColumn('pipeline').toArray(),
                        parent: resultObject.resultTable.getColumn('parent').toArray(),
                        operatorOccurrences: resultObject.resultTable.getColumn('occurrences').toArray(),
                        pipelineOccurrences: resultObject.resultTable.getColumn('pipeOccurrences').toArray(),
                    }
                });
            break;

    }

    chartDataCollection[requestId] = chartDataElem!;
    store.dispatch({
        type: model.StateMutationType.SET_CHARTDATA,
        data: chartDataCollection,
    });

    store.dispatch({
        type: model.StateMutationType.SET_RESULTLOADING,
        data: { key: requestId, value: false },
    });

}

