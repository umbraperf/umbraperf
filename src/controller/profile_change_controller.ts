import * as model from '../model';
import { store, appContext } from '../app_config';
import history from '../history';
import { setEvent } from '.';


export function changeProfile(newProfile: model.ProfileType) {

    switch (newProfile) {

        case model.ProfileType.OVERVIEW:
            // console.log("new profile: overview")
            setAppstateProfile(model.ProfileType.OVERVIEW);
            setAppstateEvent("cycles:ppp");
            setAppstateView(model.ViewType.DASHBOARD_SINGLE_EVENT);
            setAppstateBucketSize(1);
            setAppstateInterpolation("basis");
            redirectToView(model.ViewType.DASHBOARD_SINGLE_EVENT);
            break;

        case model.ProfileType.DETAIL_ANALYSIS:
            // console.log("new profile: detail")
            setAppstateProfile(model.ProfileType.DETAIL_ANALYSIS);
            setAppstateEvent("cycles:ppp");
            setAppstateView(model.ViewType.DASHBOARD_SINGLE_EVENT);
            setAppstateBucketSize(0.5);
            setAppstateInterpolation("step");
            redirectToView(model.ViewType.DASHBOARD_SINGLE_EVENT);
            break;

        case model.ProfileType.MEMORY_BEHAVIOUR:
            // console.log("new profile: memory")
            setAppstateProfile(model.ProfileType.MEMORY_BEHAVIOUR);
            setAppstateEvent("mem_inst_retired.all_loads");
            setAppstateView(model.ViewType.DASHBOARD_MEMORY_BEHAVIOR);
            setAppstateBucketSize(1);
            setAppstateInterpolation("basis");
            redirectToView(model.ViewType.DASHBOARD_MEMORY_BEHAVIOR);
            break;

        case model.ProfileType.CACHE_ANALYSIS:
            // console.log("new profile: cache")
            setAppstateProfile(model.ProfileType.CACHE_ANALYSIS);
            setAppstateMultipleEvent("l1-cache-misses", "l3-cache-misses");
            setAppstateView(model.ViewType.DASHBOARD_MULTIPLE_EVENTS);
            setAppstateBucketSize(1);
            setAppstateInterpolation("basis");
            redirectToView(model.ViewType.DASHBOARD_MULTIPLE_EVENTS);
            break;

        case model.ProfileType.UIR_ANALYSIS:
            // console.log("new profile: uir")
            setAppstateProfile(model.ProfileType.UIR_ANALYSIS);
            setAppstateEvent("cycles:ppp");
            setAppstateView(model.ViewType.DASHBOARD_UIR_PROFILING);
            setAppstateBucketSize(1);
            setAppstateInterpolation("basis");
            redirectToView(model.ViewType.DASHBOARD_UIR_PROFILING);
            break;

    }

}

function setAppstateProfile(profile: model.ProfileType) {
    store.dispatch({
        type: model.StateMutationType.SET_CURRENT_PROFILE,
        data: profile,
    });
}

function setAppstateEvent(event: string) {
    const events = store.getState().events;
    if (events && events.includes(event)) {
        setEvent(event);
    }
}

function setAppstateMultipleEvent(event1: string, event2: string) {
    const events = store.getState().events;
    if (events && events.includes(event1) && events.includes(event2)) {
        setEvent(event1, event2);
    }
}

function setAppstateView(view: model.ViewType) {
    store.dispatch({
        type: model.StateMutationType.SET_CURRENT_VIEW,
        data: view,
    });
}

function setAppstateInterpolation(interpolation: string) {
    store.dispatch({
        type: model.StateMutationType.SET_CURRENT_INTERPOLATION,
        data: interpolation,
    });
}

function setAppstateBucketSize(bucketSize: number) {
    store.dispatch({
        type: model.StateMutationType.SET_CURRENT_BUCKETSIZE,
        data: bucketSize,
    });
}

function redirectToView(viewType: model.ViewType) {
    const viewPath = appContext.topLevelComponents.find((elem) => elem.viewType === viewType)?.path;
    history.push(viewPath!);
}
