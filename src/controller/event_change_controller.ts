import * as model from "../model";
import { store, appContext } from '../app_config';
import { requestActiveOperatorsPipelines, resetSelectionCurrentAbsoluteSwimLaneMaxYDomain, resetSelectionTimeframe } from ".";

export function setEvent(newEvent1: string, newEvent2?: string) {

    performPreEventChangeSideActions();

    const currentEvent = store.getState().currentEvent;
    dispachSingleEvent(newEvent1);

    if (undefined === newEvent2 && newEvent1) {
        //only single event was provided: set new single event and set multiple event with event1: new event and event2: old event
        dispachMultipleEvent(newEvent1, currentEvent);
    } else if (newEvent1 && newEvent2) {
        //two events were provided: set both new events to new multiple event, set single event to first event
        dispachMultipleEvent(newEvent1, newEvent2);
    }
    performPostEventChangeSideActions();
}

export function dispachSingleEvent(event: string) {
    store.dispatch({
        type: model.StateMutationType.SET_CURRENT_EVENT,
        data: event,
    });
}

export function dispachMultipleEvent(event1: string, event2: string) {
    store.dispatch({
        type: model.StateMutationType.SET_CURRENT_MULTIPLE_EVENT,
        data: [event1, event2],
    });
}

function performPreEventChangeSideActions() {
    //requestActiveOperatorsPipelines(appContext.controller);
    resetSelectionTimeframe();
    resetSelectionCurrentAbsoluteSwimLaneMaxYDomain();
}

function performPostEventChangeSideActions() {
    requestActiveOperatorsPipelines(appContext.controller);
}
