import * as model from "../model";
import { store, appContext } from '../app_config';
import { ChartWrapperAppstateProps } from '../components/charts/chart_wrapper';
import _ from "lodash";
import { requestActiveOperatorsPipelines, requestActiveOperatorsTimeframePipeline } from ".";
import ChartResetButton from '../components/utils/togglers/chart_reset_button';
import React from "react";

export function handleOperatorSelection(selectedOperator: string, selectedOperatorPipeline?: string) {

    const currentOperator = store.getState().currentOperator;
    const operators = store.getState().operators;
    const operatorsTimefrabe = store.getState().currentOperatorActiveTimeframePipeline;

    if (operatorsTimefrabe.includes(selectedOperator) && operators!.operatorsId.includes(selectedOperator)) {

        if (currentOperator === "All" || !currentOperator.includes("")) {
            store.dispatch({
                type: model.StateMutationType.SET_CURRENT_OPERATOR,
                data: operators!.operatorsId.map((elem, index) => (elem === selectedOperator ? elem : "")),
            });
        } else {
            const selectedIndexPosition = operators!.operatorsId.indexOf(selectedOperator);
            if (currentOperator[selectedIndexPosition] === "") {
                //Operator was disbaled and will be enabled
                // const currentPipeline = store.getState().currentPipeline;
                // if (selectedOperatorPipeline && !currentPipeline.includes(selectedOperatorPipeline)) {
                //     // Automatically enable pipeline on operator selection if pipeline of operator was disabled 
                //     handlePipelineSelection(selectedOperatorPipeline);
                // }
                store.dispatch({
                    type: model.StateMutationType.SET_CURRENT_OPERATOR,
                    data: currentOperator.map((elem, index) => (index === selectedIndexPosition ? operators!.operatorsId[index] : elem)),
                });
            } else {
                //Operator was enabled and will be disabled
                store.dispatch({
                    type: model.StateMutationType.SET_CURRENT_OPERATOR,
                    data: currentOperator.map((elem, index) => (index === selectedIndexPosition ? "" : elem)),
                });
            }
        }
    }
}

export function handlePipelineSelection(selectedPipeline: string) {

    const currentPipeline = store.getState().currentPipeline;
    const pipelines = store.getState().pipelines;
    if (currentPipeline === "All" || !currentPipeline.includes("")) {
        store.dispatch({
            type: model.StateMutationType.SET_CURRENT_PIPELINE,
            data: pipelines!.map((elem, index) => (elem === selectedPipeline ? elem : "")),
        });
    } else {
        const selectedIndexPosition = pipelines!.indexOf(selectedPipeline);
        if (currentPipeline[selectedIndexPosition] === "") {
            store.dispatch({
                type: model.StateMutationType.SET_CURRENT_PIPELINE,
                data: currentPipeline.map((elem, index) => (index === selectedIndexPosition ? pipelines![index] : elem)),
            });
        } else {
            store.dispatch({
                type: model.StateMutationType.SET_CURRENT_PIPELINE,
                data: currentPipeline.map((elem, index) => (index === selectedIndexPosition ? "" : elem)),
            });
        }
    }
    requestActiveOperatorsTimeframePipeline(appContext.controller);
}

export function handleTimeBucketSelection(selectedTimeBuckets: [number, number], selectedPosition: [number, number]) {
    store.dispatch({
        type: model.StateMutationType.SET_CURRENT_TIME_BUCKET_SELECTION_TUPLE,
        data: selectedTimeBuckets,
    });
    store.dispatch({
        type: model.StateMutationType.SET_CURRENT_TIME_POSITION_SELECTION_TUPLE,
        data: selectedPosition,
    });
    requestActiveOperatorsPipelines(appContext.controller);
}

export function handleMemoryAddressSelectionTuple(selectedMemoryAddressTuple: [number, number]) {
    // const currentMemoryAddressTuple = store.getState().currentMemoryAddressSelectionTuple;
    // if (currentMemoryAddressTuple[0] !== selectedMemoryAddressTuple[0] ||
    //     currentMemoryAddressTuple[1] !== selectedMemoryAddressTuple[1]) {
        store.dispatch({
            type: model.StateMutationType.SET_CURRENT_MEMORY_ADDRESS_SELECTION_TUPLE,
            data: selectedMemoryAddressTuple,
        });
}

export function resetSelectionTimeselection() {
    handleTimeBucketSelection([-1, -1], [-1, -1]);
    requestActiveOperatorsPipelines(appContext.controller);
}

export function resetSelectionPipelinesOperators() {
    resetCurrentOperatorSelection();
    resetCurrentPipelineSelection();
    requestActiveOperatorsPipelines(appContext.controller);
}

function resetCurrentOperatorSelection() {
    store.dispatch({
        type: model.StateMutationType.SET_CURRENT_OPERATOR,
        data: store.getState().operators!.operatorsId,
    });
}

function resetCurrentPipelineSelection() {
    store.dispatch({
        type: model.StateMutationType.SET_CURRENT_PIPELINE,
        data: store.getState().pipelines!,
    });
}

export function createChartResetComponent(resetType: "pipelinesOperators" | "timeselection") {
    if (resetType === "pipelinesOperators") {
        const isResetButtonVisible = () => {
            if ((store.getState().currentOperator !== "All"
                && !_.isEqual(store.getState().currentOperator, store.getState().operators!.operatorsId))
                || (store.getState().currentPipeline !== "All"
                    && !_.isEqual(store.getState().currentPipeline, store.getState().pipelines))) {
                return true;
            } else {
                return false;
            }
        }
        return isResetButtonVisible() && React.createElement(ChartResetButton, { chartResetButtonFunction: resetSelectionPipelinesOperators });
    } else if (resetType === "timeselection") {
        const isResetButtonVisible = () => {
            if (store.getState().currentTimeBucketSelectionTuple[0] >= 0 || store.getState().currentTimeBucketSelectionTuple[1] >= 0) {
                return true;
            } else {
                return false;
            }
        }
        return isResetButtonVisible() && React.createElement(ChartResetButton, { chartResetButtonFunction: resetSelectionTimeselection });
    }
}

export function chartRerenderNeeded(nextProps: ChartWrapperAppstateProps, props: ChartWrapperAppstateProps, chartType: model.ChartType): boolean {

    const isMetadataAvailable = () => {
        if (nextProps.pipelines &&
            nextProps.operators &&
            nextProps.events) {
            return true;
        } else {
            return false;
        }
    }

    const isChartDataInputChangedGeneral = () => {
        if (metadataAvailable &&
            (nextProps.currentView !== props.currentView ||
                !_.isEqual(nextProps.pipelines, props.pipelines) ||
                !_.isEqual(nextProps.operators, props.operators))) {
            return true;
        } else {
            return false;
        }
    }

    const isEventChartDataInputChangedGeneral = () => {
        if (metadataAvailable &&
            (nextProps.currentEvent !== props.currentEvent)) {
            return true;
        } else {
            return false;
        }
    }

    const metadataAvailable = isMetadataAvailable();
    const chartDataInputChangedGeneral = isChartDataInputChangedGeneral();
    const evenChartDataInputChangedGeneral = isEventChartDataInputChangedGeneral();

    const chartDataInputChangedChart: () => boolean = () => {
        switch (chartType) {
            case model.ChartType.BAR_CHART_ACTIVITY_HISTOGRAM:
                return (evenChartDataInputChangedGeneral ||
                    chartDataInputChangedGeneral ||
                    nextProps.currentBucketSize !== props.currentBucketSize) ?
                    true :
                    false;
            case model.ChartType.SUNBURST_CHART:
                return (evenChartDataInputChangedGeneral ||
                    chartDataInputChangedGeneral ||
                    !_.isEqual(nextProps.currentTimeBucketSelectionTuple, props.currentTimeBucketSelectionTuple)) ?
                    true :
                    false;
            case model.ChartType.BAR_CHART:
                return (evenChartDataInputChangedGeneral ||
                    chartDataInputChangedGeneral ||
                    !_.isEqual(nextProps.currentTimeBucketSelectionTuple, props.currentTimeBucketSelectionTuple) ||
                    !_.isEqual(nextProps.currentPipeline, props.currentPipeline)) ?
                    true :
                    false;
            case model.ChartType.SWIM_LANES_MULTIPLE_PIPELINES:
            case model.ChartType.SWIM_LANES_MULTIPLE_PIPELINES_ABSOLUTE:
                return (evenChartDataInputChangedGeneral ||
                    chartDataInputChangedGeneral ||
                    nextProps.currentBucketSize !== props.currentBucketSize ||
                    !_.isEqual(nextProps.currentOperator, props.currentOperator) ||
                    !_.isEqual(nextProps.currentPipeline, props.currentPipeline) ||
                    !_.isEqual(nextProps.currentTimeBucketSelectionTuple, props.currentTimeBucketSelectionTuple)) ?
                    true :
                    false;
            case model.ChartType.SWIM_LANES_COMBINED_MULTIPLE_PIPELINES:
            case model.ChartType.SWIM_LANES_COMBINED_MULTIPLE_PIPELINES_ABSOLUTE:
                return (evenChartDataInputChangedGeneral ||
                    chartDataInputChangedGeneral ||
                    nextProps.currentBucketSize !== props.currentBucketSize ||
                    !_.isEqual(nextProps.currentOperator, props.currentOperator) ||
                    !_.isEqual(nextProps.currentPipeline, props.currentPipeline) ||
                    !_.isEqual(nextProps.currentTimeBucketSelectionTuple, props.currentTimeBucketSelectionTuple)) ?
                    true :
                    false;
            case model.ChartType.MEMORY_ACCESS_HEATMAP_CHART:
                return (evenChartDataInputChangedGeneral ||
                    chartDataInputChangedGeneral ||
                    nextProps.currentBucketSize !== props.currentBucketSize ||
                    nextProps.memoryHeatmapsDifferenceRepresentation !== props.memoryHeatmapsDifferenceRepresentation ||
                    !_.isEqual(nextProps.currentTimeBucketSelectionTuple, props.currentTimeBucketSelectionTuple) ||
                    !_.isEqual(nextProps.currentMemoryAddressSelectionTuple, props.currentMemoryAddressSelectionTuple)) ?
                    true :
                    false;
            case model.ChartType.UIR_VIEWER:
                return (chartDataInputChangedGeneral ||
                    !_.isEqual(nextProps.currentTimeBucketSelectionTuple, props.currentTimeBucketSelectionTuple)) ?
                    true :
                    false;
            case model.ChartType.QUERY_PLAN:
                return (evenChartDataInputChangedGeneral ||
                    chartDataInputChangedGeneral ||
                    !_.isEqual(nextProps.operators, props.operators) ||
                    !_.isEqual(nextProps.currentOperator, props.currentOperator) ||
                    !_.isEqual(nextProps.currentPipeline, props.currentPipeline) ||
                    !_.isEqual(nextProps.currentTimeBucketSelectionTuple, props.currentTimeBucketSelectionTuple)) ?
                    true :
                    false;
        }
        return false;
    };

    if (chartDataInputChangedChart()) {
        return true;
    }

    return false;
}

export function isOperatorUnavailable(operatorId: string) {
    return !(store.getState().operators!.operatorsId.includes(operatorId) && (store.getState().currentOperatorActiveTimeframePipeline === "All" || store.getState().currentOperatorActiveTimeframePipeline.includes(operatorId)))
}

export function isOperatorSelected(operatorId: string) {
    return store.getState().currentOperator === "All" || store.getState().currentOperator.includes(operatorId);
}

