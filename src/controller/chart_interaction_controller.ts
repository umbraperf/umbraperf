import * as model from '../model';
import { store, appContext } from '../app_config';
import { ChartWrapperAppstateProps } from '../components/charts/chart_wrapper';
import _ from "lodash";
import { requestActiveOperatorsPipelines, requestActiveOperatorsTimeframePipeline } from '.';
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

export function handleHeatmapsOutlierDetectionSelection(selectedoutlierDetectionDegree: model.HeatmapsOutlierDetectionDegrees) {
    store.dispatch({
        type: model.StateMutationType.SET_CURRENT_HEATMAPS_OUTLIER_DETECTION,
        data: selectedoutlierDetectionDegree,
    });
}

export function handleHeatmapsDifferenceRepresentationSelection(memoryHeatmapsDifferenceRepresentation: boolean) {
    store.dispatch({
        type: model.StateMutationType.SET_MEMORY_HEATMAPS_DIFFERENCE_REPRESENTATION,
        data: memoryHeatmapsDifferenceRepresentation,
    });
}


export function resetSelectionTimeframe() {
    handleTimeBucketSelection([-1, -1], [-1, -1]);
    requestActiveOperatorsPipelines(appContext.controller);
}

export function resetSelectionPipelinesOperators() {
    resetCurrentOperatorSelection();
    resetCurrentPipelineSelection();
    requestActiveOperatorsPipelines(appContext.controller);
}

export function resetSelectionHeatmapsOutlierDetectionSelection() {
    handleHeatmapsOutlierDetectionSelection(0);
}

export function setCurrentAbsoluteSwimLaneMaxYDomain(newYDomainValue: number) {
    if (store.getState().currentAbsoluteSwimLaneMaxYDomain < newYDomainValue) {
        store.dispatch({
            type: model.StateMutationType.SET_CURRENT_ABSOLUTE_SWIMLANE_MAX_Y_DOMAIN,
            data: newYDomainValue,
        });
    }
}

export function resetSelectionCurrentAbsoluteSwimLaneMaxYDomain() {
    store.dispatch({
        type: model.StateMutationType.SET_CURRENT_ABSOLUTE_SWIMLANE_MAX_Y_DOMAIN,
        data: 0,
    });
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

export function setKpiValuesFormated(newKpiValuesFormated: model.IKpiValuesFormated) {
    store.dispatch({
        type: model.StateMutationType.SET_KPI_VALUES_FORMATED,
        data: newKpiValuesFormated,
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
        return isResetButtonVisible() && React.createElement(ChartResetButton, { chartResetButtonFunction: resetSelectionTimeframe });
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
                    !_.isEqual(nextProps.currentHeatmapsOutlierDetection, props.currentHeatmapsOutlierDetection)) ?
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

export function setChartIdCounter(newChartIdCounter: number) {
    store.dispatch({
        type: model.StateMutationType.SET_CHART_ID_COUNTER,
        data: newChartIdCounter,
    });
}

export function setCurrentChart(newCurrentChart: model.ChartType) {
    store.dispatch({
        type: model.StateMutationType.SET_CURRENT_CHART,
        data: newCurrentChart,
    });
}

export function setCurrentView(newCurrentView: model.ViewType) {
    store.dispatch({
        type: model.StateMutationType.SET_CURRENT_VIEW,
        data: newCurrentView,
    });
}

export function setCurrentBucketSize(newCurrentBucketSize: number) {
    store.dispatch({
        type: model.StateMutationType.SET_CURRENT_BUCKETSIZE,
        data: newCurrentBucketSize,
    });
}

export function setCurrentInterpolation(newCurrentInterpolation: string) {
    store.dispatch({
        type: model.StateMutationType.SET_CURRENT_INTERPOLATION,
        data: newCurrentInterpolation,
    });
}

