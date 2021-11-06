import * as model from "../model";
import { store } from '../app_config';

export function handleOperatorSelection(operator: string){

}

export function handlePipelineSelection(pipeline: string){

    const selectedPipeline = pipeline;
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

export function timeBucketSelection(from: number, to: number){

}
