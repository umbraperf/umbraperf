import AppsIcon from '@material-ui/icons/Apps';
import MemoryIcon from '@material-ui/icons/Memory';
import CodeIcon from '@material-ui/icons/Code';
import CachedIcon from '@material-ui/icons/Cached';
import SearchIcon from '@material-ui/icons/Search';
import React from 'react';

export enum ProfileType {
    OVERVIEW = "OVERVIEW",
    MEMORY_BEHAVIOUR = "MEMORY_BEHAVIOUR",
    DETAIL_ANALYSIS = "DETAIL_ANALYSIS",
    UIR_ANALYSIS = "UIR_ANALYSIS",
    CACHE_ANALYSIS = "CACHE_ANALYSIS",
}

const ProfileIcon = {
    OVERVIEW: React.createElement(AppsIcon),
    MEMORY_BEHAVIOUR: React.createElement(MemoryIcon),
    DETAIL_ANALYSIS: React.createElement(SearchIcon),
    UIR_ANALYSIS: React.createElement(CodeIcon),
    CACHE_ANALYSIS: React.createElement(CachedIcon),
}

export enum ProfileTitle {
    OVERVIEW = "Overview",
    MEMORY_BEHAVIOUR = "Memory Behaviour",
    DETAIL_ANALYSIS = "Detail Analysis",
    UIR_ANALYSIS = "UIR Analysis",
    CACHE_ANALYSIS = "Cache Analysis",
}

enum ProfileDescription {
    OVERVIEW = 'Gives a first overview about the query execution. If available in measurements data, cpu event "cycles" is selected and visualized at the beginning. Provides a queryplan, the distribution of pipelines and their operators, absolute operator smaples frquencies and both relative and absolute swim-lanes at an medium level of granularity. A good choice to start the profiling of a query.',
    MEMORY_BEHAVIOUR = 'Provides heatmaps to visualize memory accesses. If available in measurement data, memory loads are selected as cpu event per default. You can choose between visualizing the absolute amount of accesses at different memory adresses, as well as the differences of memory adresses being accesses during the query execution. Perfect choice for profiling memory behaviour in the course of a query execution.',
    DETAIL_ANALYSIS = 'Provides the exact same visualizations as the "Overview" profile, but at a higher level of granularity. Bucket-sizes of sample groupings are smaller and interpolations are more exact leading to more advanced but more complex visualizations. The right choice to deeper investigate in a yet well understood query.',
    UIR_ANALYSIS = 'Provides a mapping between UIR code lines and the operators causing them, as well as indicators for expensiveness of UIR lines at both function and whole query execution level. Furthermore, the most expensive UIR lines for each operator are shown inside a queryplan. If provided in the measurement data, the cpu event "cycles" is selected per default.',
    CACHE_ANALYSIS = 'Chooses, if available in measurement data, "l1-chache-misses" and "l3-chache-misses" as default event to be visualized in parallel for enabling comparisons and detecting relations. Besides a queryplan and the distribution of operators and pipelines, a combined swim-lanes including both events are presented. Perfect chioce for investigating in cache misses and to observe the chache access behaviour of different operators.',
}

type Profile<T, I, R, D> = {
    readonly type: T,
    readonly icon: I,
    readonly readableName: R,
    readonly description: D,
}


export type ProfileVariant =
    | Profile<ProfileType.OVERVIEW, typeof ProfileIcon.OVERVIEW, ProfileTitle.OVERVIEW, ProfileDescription.OVERVIEW>
    | Profile<ProfileType.MEMORY_BEHAVIOUR, typeof ProfileIcon.MEMORY_BEHAVIOUR, ProfileTitle.MEMORY_BEHAVIOUR, ProfileDescription.MEMORY_BEHAVIOUR>
    | Profile<ProfileType.DETAIL_ANALYSIS, typeof ProfileIcon.DETAIL_ANALYSIS, ProfileTitle.DETAIL_ANALYSIS, ProfileDescription.DETAIL_ANALYSIS>
    | Profile<ProfileType.UIR_ANALYSIS, typeof ProfileIcon.UIR_ANALYSIS, ProfileTitle.UIR_ANALYSIS, ProfileDescription.UIR_ANALYSIS>
    | Profile<ProfileType.CACHE_ANALYSIS, typeof ProfileIcon.CACHE_ANALYSIS, ProfileTitle.CACHE_ANALYSIS, ProfileDescription.CACHE_ANALYSIS>
    ;

export function createProfiles(): ProfileVariant[] {
    const profiles: ProfileVariant[] = [
        {
            type: ProfileType.OVERVIEW,
            icon: ProfileIcon.OVERVIEW,
            readableName: ProfileTitle.OVERVIEW,
            description: ProfileDescription.OVERVIEW,
        },
        {
            type: ProfileType.MEMORY_BEHAVIOUR,
            icon: ProfileIcon.MEMORY_BEHAVIOUR,
            readableName: ProfileTitle.MEMORY_BEHAVIOUR,
            description: ProfileDescription.MEMORY_BEHAVIOUR,
        },
        {
            type: ProfileType.DETAIL_ANALYSIS,
            icon: ProfileIcon.DETAIL_ANALYSIS,
            readableName: ProfileTitle.DETAIL_ANALYSIS,
            description: ProfileDescription.DETAIL_ANALYSIS,
        },
        {
            type: ProfileType.UIR_ANALYSIS,
            icon: ProfileIcon.UIR_ANALYSIS,
            readableName: ProfileTitle.UIR_ANALYSIS,
            description: ProfileDescription.UIR_ANALYSIS,
        },
        {
            type: ProfileType.CACHE_ANALYSIS,
            icon: ProfileIcon.CACHE_ANALYSIS,
            readableName: ProfileTitle.CACHE_ANALYSIS,
            description: ProfileDescription.CACHE_ANALYSIS,
        }
    ]
    return profiles;
}


