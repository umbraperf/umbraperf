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

export function requestNewChartData(props: ChartWrapperAppstateProps, prevProps: ChartWrapperAppstateProps, chartType: model.ChartType, chartId: number) {

    const newChartDataNeededGeneral = () => {
        if (props.events &&
            props.pipelines &&
            props.operators &&
            (props.currentEvent !== prevProps.currentEvent ||
                props.currentView !== prevProps.currentView ||
                !_.isEqual(props.pipelines, prevProps.pipelines) ||
                !_.isEqual(props.operators, prevProps.operators) ||
                !_.isEqual(props.currentTimeBucketSelectionTuple, prevProps.currentTimeBucketSelectionTuple))) {
            return true;
        } else {
            return false;
        }
    }

    let newChartDataNeededChart = false;
    switch (chartType) {

        case model.ChartType.SUNBURST_CHART:
            const newChartDataNeededSunburst = () => {
                return true;
            }
            newChartDataNeededChart = newChartDataNeededSunburst();
            break;

    }

    if (newChartDataNeededGeneral() && newChartDataNeededChart) {
        Controller.requestChartData(props.appContext.controller, chartId, chartType);
    }

}
