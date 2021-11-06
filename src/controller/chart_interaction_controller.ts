import * as model from "../model";
import { store } from '../app_config';

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
