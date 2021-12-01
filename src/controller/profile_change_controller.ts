import * as model from '../model';
import { store } from '../app_config';


export function changeProfile(newProfile: model.ProfileType) {

    switch (newProfile) {

        case model.ProfileType.OVERVIEW:
            console.log("new profile: overview")
            break;

        case model.ProfileType.DETAIL_ANALYSIS:
            console.log("new profile: detail")

            break;

        case model.ProfileType.MEMORY_BEHAVIOUR:
            console.log("new profile: memory")

            break;

        case model.ProfileType.CACHE_ANALYSIS:
            console.log("new profile: cache")

            break;

        case model.ProfileType.UIR_ANALYSIS:
            console.log("new profile: uir")

            break;

    }

}

function setAppstateProfile(profile: model.ProfileType) {
    store.dispatch({
        type: model.StateMutationType.SET_CURRENTPROFILE,
        data: profile,
    });
}

function setAppstateEvent(event: string) {
    const events = store.getState().events;
    if (events && events.includes(event)) {
        store.dispatch({
            type: model.StateMutationType.SET_CURRENTEVENT,
            data: event,
        });
    }
}

function setAppstateMultipleEvent(event1: string, event2: string) {
    const events = store.getState().events;
    if (events && events.includes(event1) && events.includes(event2)) {
        store.dispatch({
            type: model.StateMutationType.SET_CURRENTMULTIPLEEVENT,
            data: [event1, event2],
        });
    }
}

function setAppstateView(view: model.ViewType) {
    store.dispatch({
        type: model.StateMutationType.SET_CURRENTVIEW,
        data: view,
    });
}

function setAppstateInterpolation(interpolation: string) {
    store.dispatch({
        type: model.StateMutationType.SET_CURRENTINTERPOLATION,
        data: interpolation,
    });
}

function setAppstateBucketSize(bucketSize: number) {
    store.dispatch({
        type: model.StateMutationType.SET_CURRENTBUCKETSIZE,
        data: bucketSize,
    });
}
