import * as model from "../model";
import { store } from '../app_config';
import { ChartWrapperAppstateProps } from '../components/charts/chart_wrapper';
import { QueryPlanWrapperAppstateProps } from '../components/charts/queryplan/query_plan_wrapper';
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

export function resetTimeBucketSelection() {
    handleTimeBucketSelection([-1, -1], [-1, -1]);
}

export function chartRerenderNeeded(nextProps: ChartWrapperAppstateProps, props: ChartWrapperAppstateProps, chartType: model.ChartType): boolean {

    const chartDataInputChangedGeneral = () => {
        if (nextProps.events &&
            nextProps.pipelines &&
            nextProps.operators &&
            (nextProps.currentView !== props.currentView ||
                !_.isEqual(nextProps.pipelines, props.pipelines) ||
                !_.isEqual(nextProps.operators, props.operators))) {
            return true;
        } else {
            return false;
        }
    }

    const vegaChartDataInputChangedGeneral = () => {
        if (nextProps.currentEvent !== props.currentEvent) {
            return true;
        } else {
            return false;
        }
    }

    if (chartDataInputChangedGeneral()) {
        return true;
    } else {
        const chartDataInputChangedChart: () => boolean = () => {
            switch (chartType) {
                case model.ChartType.BAR_CHART_ACTIVITY_HISTOGRAM:
                    return (vegaChartDataInputChangedGeneral() ||
                        nextProps.currentBucketSize !== props.currentBucketSize) ?
                        true :
                        false;
                case model.ChartType.SUNBURST_CHART:
                    return (vegaChartDataInputChangedGeneral() ||
                        !_.isEqual(nextProps.currentTimeBucketSelectionTuple, props.currentTimeBucketSelectionTuple)) ?
                        true :
                        false;
                case model.ChartType.BAR_CHART:
                    return (vegaChartDataInputChangedGeneral() ||
                        !_.isEqual(nextProps.currentTimeBucketSelectionTuple, props.currentTimeBucketSelectionTuple)) ?
                        true :
                        false;
                case model.ChartType.SWIM_LANES_MULTIPLE_PIPELINES:
                case model.ChartType.SWIM_LANES_MULTIPLE_PIPELINES_ABSOLUTE:
                    return (vegaChartDataInputChangedGeneral() ||
                        nextProps.currentBucketSize !== props.currentBucketSize ||
                        !_.isEqual(nextProps.currentOperator, props.currentOperator) ||
                        !_.isEqual(nextProps.currentPipeline, props.currentPipeline) ||
                        !_.isEqual(nextProps.currentTimeBucketSelectionTuple, props.currentTimeBucketSelectionTuple)) ?
                        true :
                        false;
                case model.ChartType.SWIM_LANES_COMBINED_MULTIPLE_PIPELINES:
                case model.ChartType.SWIM_LANES_COMBINED_MULTIPLE_PIPELINES_ABSOLUTE:
                    return (vegaChartDataInputChangedGeneral() ||
                        nextProps.currentBucketSize !== props.currentBucketSize ||
                        !_.isEqual(nextProps.currentOperator, props.currentOperator) ||
                        !_.isEqual(nextProps.currentPipeline, props.currentPipeline) ||
                        !_.isEqual(nextProps.currentTimeBucketSelectionTuple, props.currentTimeBucketSelectionTuple)) ?
                        true :
                        false;
                case model.ChartType.MEMORY_ACCESS_HEATMAP_CHART:
                    return (vegaChartDataInputChangedGeneral() ||
                        nextProps.currentBucketSize !== props.currentBucketSize ||
                        nextProps.memoryHeatmapsDifferenceRepresentation !== props.memoryHeatmapsDifferenceRepresentation ||
                        !_.isEqual(nextProps.currentTimeBucketSelectionTuple, props.currentTimeBucketSelectionTuple)) ?
                        true :
                        false;
                case model.ChartType.UIR_VIEWER:
                    return (!_.isEqual(nextProps.operators, props.operators) ||
                        !_.isEqual(nextProps.currentTimeBucketSelectionTuple, props.currentTimeBucketSelectionTuple)) ?
                        true :
                        false;
            }
            return false;
        };

        if (chartDataInputChangedChart()) {
            return true;
        }
    }

    return false;
}

export function queryPlanRerenderNeeded(props: QueryPlanWrapperAppstateProps, prevProps: QueryPlanWrapperAppstateProps, width: number, prevWidth: number): boolean {
    if (props.operators &&
        (props.queryPlan !== prevProps.queryPlan ||
            props.currentView !== prevProps.currentView ||
            width !== prevWidth ||
            !_.isEqual(props.operators, prevProps.operators) ||
            !_.isEqual(props.currentOperator, prevProps.currentOperator))) {
        return true;
    } else {
        return false;
    }
}


