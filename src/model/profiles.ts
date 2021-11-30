import AppsIcon from '@material-ui/icons/Apps';
import MemoryIcon from '@material-ui/icons/Memory';
import CodeIcon from '@material-ui/icons/Code';
import CachedIcon from '@material-ui/icons/Cached';
import SearchIcon from '@material-ui/icons/Search';

export enum ProfilesType {
    OVERVIEW = "OVERVIEW",
    MEMORY_BEHAVIOUR = "MEMORY_BEHAVIOUR",
    DETAIL_ANALYSIS = "DETAIL_ANALYSIS",
    UIR_ANALYSIS = "UIR_ANALYSIS",
    CACHE_ANALYSIS = "CACHE_ANALYSIS",
}

export type Profile = {
    readonly type: ProfilesType,
    readonly icon: JSX.Element,
    readonly title: string,
}

export function createProfiles(): Profile[] {
    return [];
}


