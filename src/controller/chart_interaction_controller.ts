import * as model from "../model";
import { store, appContext } from '../app_config';
import { ChartWrapperAppstateProps } from '../components/charts/chart_wrapper';
import _ from "lodash";
import { requestActiveOperatorsTimeframe } from ".";

export function handleOperatorSelection(selectedOperator: string, selectedOperatorPipeline?: string) {

    const currentOperator = store.getState().currentOperator;
    const operators = store.getState().operators;
    const operatorsTimefrabe = store.getState().currentOperatorTimeframe;

    if (operatorsTimefrabe.includes(selectedOperator) && operators!.operatorsId.includes(selectedOperator)) {

        if (currentOperator === "All" || !currentOperator.includes("")) {
            store.dispatch({
                type: model.StateMutationType.SET_CURRENTOPERATOR,
                data: operators!.operatorsId.map((elem, index) => (elem === selectedOperator ? elem : "")),
            });
        } else {
            const selectedIndexPosition = operators!.operatorsId.indexOf(selectedOperator);
            if (currentOperator[selectedIndexPosition] === "") {
                //Operator was disbaled and will be enabled

                const currentPipeline = store.getState().currentPipeline;
                if (selectedOperatorPipeline && !currentPipeline.includes(selectedOperatorPipeline)) {
                    // Automatically enable pipeline on operator selection if pipeline of operator was disabled 
                    handlePipelineSelection(selectedOperatorPipeline);
                }
                store.dispatch({
                    type: model.StateMutationType.SET_CURRENTOPERATOR,
                    data: currentOperator.map((elem, index) => (index === selectedIndexPosition ? operators!.operatorsId[index] : elem)),
                });
            } else {
                //Operator was enabled and will be disabled

                store.dispatch({
                    type: model.StateMutationType.SET_CURRENTOPERATOR,
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
    requestActiveOperatorsTimeframe(appContext.controller);
}

export function resetTimeBucketSelection() {
    handleTimeBucketSelection([-1, -1], [-1, -1]);
    requestActiveOperatorsTimeframe(appContext.controller);
}

export function resetSunburstSelection() {
    resetCurrentOperatorSelection();
    resetCurrentPipelineSelection();
}

function resetCurrentOperatorSelection() {
    store.dispatch({
        type: model.StateMutationType.SET_CURRENTOPERATOR,
        data: store.getState().operators!.operatorsId,
    });
}

function resetCurrentPipelineSelection() {
    store.dispatch({
        type: model.StateMutationType.SET_CURRENTPIPELINE,
        data: store.getState().pipelines!,
    });
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
                    !_.isEqual(nextProps.currentTimeBucketSelectionTuple, props.currentTimeBucketSelectionTuple)) ?
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
                    !_.isEqual(nextProps.currentTimeBucketSelectionTuple, props.currentTimeBucketSelectionTuple)) ?
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

// export function queryPlanRerenderNeeded(props: QueryPlanWrapperAppstateProps, prevProps: QueryPlanWrapperAppstateProps, width: number, prevWidth: number): boolean {
//     if (props.operators &&
//         props.queryPlan &&
        // TODO queryplan comparison necessare?
//         (props.queryPlan !== prevProps.queryPlan ||
//             props.currentView !== prevProps.currentView ||
//             width !== prevWidth ||
//             !_.isEqual(props.operators, prevProps.operators) ||
//             !_.isEqual(props.currentOperator, prevProps.currentOperator))) {
//         return true;
//     } else {
//         return false;
//     }
// }


