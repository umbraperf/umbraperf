import * as model from '../model';

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