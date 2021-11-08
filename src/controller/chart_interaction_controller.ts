import * as model from "../model";
import * as Controller from './';
import { store } from '../app_config';
import { ChartWrapperAppstateProps } from '../components/charts/chart_wrapper';
import _ from "lodash";

export function handleOperatorSelection(selectedOperator: string, selectedOperatorPipeline?: string) {

    const currentOperator = store.getState().currentOperator;
    const currentPipeline = store.getState().currentPipeline;
    const operators = store.getState().operators;

    if (currentOperator === "All" || !currentOperator.includes("")) {
        store.dispatch({
            type: model.StateMutationType.SET_CURRENTOPERATOR,
            data: operators!.map((elem, index) => (elem === selectedOperator ? elem : "")),
        });
    } else {
        const selectedIndexPosition = operators!.indexOf(selectedOperator);
        if (currentOperator[selectedIndexPosition] === "") {
            if (selectedOperatorPipeline && currentPipeline.includes(selectedOperatorPipeline)) {
                handlePipelineSelection(selectedOperatorPipeline);
            }
            store.dispatch({
                type: model.StateMutationType.SET_CURRENTOPERATOR,
                data: currentOperator.map((elem, index) => (index === selectedIndexPosition ? operators![index] : elem)),
            });
        } else {
            store.dispatch({
                type: model.StateMutationType.SET_CURRENTOPERATOR,
                data: currentOperator.map((elem, index) => (index === selectedIndexPosition ? "" : elem)),
            });
        }
    }

}

export function handlePipelineSelection(selectedPipeline: string) {

    const currentPipeline = store.getState().currentPipeline;
    const pipelines = store.getState().pipelines;
    if (currentPipeline === "All" || !currentPipeline.includes("")) {
        store.dispatch({
            type: model.StateMutationType.SET_CURRENTPIPELINE,
            data: pipelines!.map((elem, index) => (elem === selectedPipeline ? elem : "")),
        });
    } else {
        const selectedIndexPosition = pipelines!.indexOf(selectedPipeline);
        if (currentPipeline[selectedIndexPosition] === "") {
            store.dispatch({
                type: model.StateMutationType.SET_CURRENTPIPELINE,
                data: currentPipeline.map((elem, index) => (index === selectedIndexPosition ? pipelines![index] : elem)),
            });
        } else {
            store.dispatch({
                type: model.StateMutationType.SET_CURRENTPIPELINE,
                data: currentPipeline.map((elem, index) => (index === selectedIndexPosition ? "" : elem)),
            });
        }
    }

}

export function handleTimeBucketSelection(selectedTimeBuckets: [number, number], selectedPosition: [number, number]) {
    store.dispatch({
        type: model.StateMutationType.SET_CURRENTTIMEBUCKETSELECTIONTUPLE,
        data: selectedTimeBuckets,
    });
    store.dispatch({
        type: model.StateMutationType.SET_CURRENTTIMEPOSITIONSELECTIONTUPLE,
        data: selectedPosition,
    });

}

export function chartRerenderNeeded(props: ChartWrapperAppstateProps, prevProps: ChartWrapperAppstateProps, chartType: model.ChartType/* , chartId: number */): boolean {

    const newChartDataNeededGeneral = () => {
        if (props.events &&
            (props.currentEvent !== prevProps.currentEvent ||
                props.currentView !== prevProps.currentView)) {
            return true;
        } else {
            return false;
        }
    }

    if (newChartDataNeededGeneral()) {
        return true;
    } else {
        const newChartDataNeededChart: () => boolean = () => {
            switch (chartType) {
                case model.ChartType.BAR_CHART_ACTIVITY_HISTOGRAM:
                    return (props.currentBucketSize !== prevProps.currentBucketSize) ?
                        true :
                        false;
                case model.ChartType.SUNBURST_CHART:
                    return (props.pipelines &&
                        props.operators &&
                        (!_.isEqual(props.pipelines, prevProps.pipelines) ||
                            !_.isEqual(props.operators, prevProps.operators) ||
                            !_.isEqual(props.currentTimeBucketSelectionTuple, prevProps.currentTimeBucketSelectionTuple))) ?
                        true :
                        false;
                case model.ChartType.BAR_CHART:
                    return (!_.isEqual(props.currentPipeline, prevProps.currentPipeline) ||
                        !_.isEqual(props.currentOperator, prevProps.currentOperator) ||
                        !_.isEqual(props.currentTimeBucketSelectionTuple, prevProps.currentTimeBucketSelectionTuple)) ?
                        true :
                        false;
                case model.ChartType.SWIM_LANES_MULTIPLE_PIPELINES:
                case model.ChartType.SWIM_LANES_MULTIPLE_PIPELINES_ABSOLUTE:
                    return (props.operators &&
                        (props.currentBucketSize !== prevProps.currentBucketSize ||
                            !_.isEqual(props.operators, prevProps.operators) ||
                            !_.isEqual(props.currentOperator, prevProps.currentOperator) ||
                            !_.isEqual(props.currentPipeline, prevProps.currentPipeline) ||
                            !_.isEqual(props.currentTimeBucketSelectionTuple, prevProps.currentTimeBucketSelectionTuple))) ?
                        true :
                        false;
                case model.ChartType.SWIM_LANES_COMBINED_MULTIPLE_PIPELINES:
                case model.ChartType.SWIM_LANES_COMBINED_MULTIPLE_PIPELINES_ABSOLUTE:
                    return (props.operators &&
                        (props.currentBucketSize !== prevProps.currentBucketSize ||
                            !_.isEqual(props.operators, prevProps.operators) ||
                            !_.isEqual(props.currentMultipleEvent, prevProps.currentMultipleEvent) ||
                            !_.isEqual(props.currentOperator, prevProps.currentOperator) ||
                            !_.isEqual(props.currentPipeline, prevProps.currentPipeline) ||
                            !_.isEqual(props.currentTimeBucketSelectionTuple, prevProps.currentTimeBucketSelectionTuple))) ?
                        true :
                        false;
                case model.ChartType.MEMORY_ACCESS_HEATMAP_CHART:
                    return (props.operators &&
                        (props.currentBucketSize !== prevProps.currentBucketSize ||
                            !_.isEqual(props.operators, prevProps.operators) ||
                            !_.isEqual(props.currentTimeBucketSelectionTuple, prevProps.currentTimeBucketSelectionTuple))) ?
                        true :
                        false;
            }
            return false;
        };

        if (newChartDataNeededChart()) {
            //Controller.requestChartData(props.appContext.controller, chartId, chartType);
            return true;
        }
    }
    return false;
}

export function chartDataRequestReady(props: ChartWrapperAppstateProps, prevProps: ChartWrapperAppstateProps, chartType: model.ChartType): boolean {
    console.log("new data request")
    switch (chartType) {
        case model.ChartType.BAR_CHART_ACTIVITY_HISTOGRAM:
            return (props.events) ?
                true :
                false;
        case model.ChartType.SUNBURST_CHART:
            return (props.events && props.pipelines && props.operators) ?
                true :
                false;
        case model.ChartType.SWIM_LANES_COMBINED_MULTIPLE_PIPELINES_ABSOLUTE:
            return (props.events && props.operators) ?
                true :
                false;
    }
    return false;
}
