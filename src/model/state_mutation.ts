import { AppState } from './state';
import { IKpiData, Result } from "./core_result";
import { RestQueryType } from './rest_queries';
import { ChartDataKeyValue } from './chart_data_result';
import { State as IDashboardState } from "../components/dashboards/dummy-dashboard"
import { ViewType } from './chart_types';


/// A mutation
export type StateMutation<T, P> = {
    readonly type: T;
    readonly data: P;
};

/// A mutation type
export enum StateMutationType {
    SET_FILELOADING = 'SET_FILELOADING',
    SET_RESULTLOADING = 'SET_RESULTLOADING',
    SET_RESULT = 'SET_RESULT',
    SET_CHUNKSNUMBER = 'SET_CHUNKSNUMBER',
    SET_FILE = 'SET_FILE',
    SET_CSVPARSINGFINISHED = 'SET_CSVPARSINGFINISHED',
    RESET_STATE = 'RESET_STATE',
    SET_CURRENTCHART = 'SET_CURRENTCHART',
    SET_CURRENTEVENT = 'SET_CURRENTEVENT',
    SET_CURRENTMULTIPLEEVENT = 'SET_CURRENTMULTIPLEEVENT',
    SET_CURRENTPIPELINE = 'SET_CURRENTPIPELINE',
    SET_CURRENTOPERATOR = 'SET_CURRENTOPERATOR',
    SET_CURRENTREQUEST = 'SET_CURRENTREQUEST',
    SET_EVENTS = 'SET_EVENTS',
    SET_PIPELINES = 'SET_PIPELINES',
    SET_OPERATORS = 'SET_OPERATORS',
    SET_KPIS = 'SET_KPIS',
    SET_CHARTIDCOUNTER = 'SET_CHARTIDCOUNTER',
    SET_CHARTDATA = 'SET_CHARTDATA',
    SET_DASHBOARDSTATE = 'SET_DASHBOARDSTATE',
    SET_CURRENTINTERPOLATION = 'SET_CURRENTINTERPOLATION',
    SET_CURRENTBUCKETSIZE = 'SET_CURRENTBUCKETSIZE',
    SET_CURRENTTIMEBUCKETSELECTIONTUPLE = 'SET_CURRENTTIMEBUCKETSELECTIONTUPLE',
    SET_CURRENTTIMEPOSITIONSELECTIONTUPLE = 'SET_CURRENTTIMEPOSITIONSELECTIONTUPLE',
    SET_CURRENTVIEW = 'SET_CURRENTVIEW',
    SET_QUERYPLAN = 'SET_QUERYPLAN',
    OTHER = 'OTHER',
}

/// An state mutation variant
export type StateMutationVariant =
    | StateMutation<StateMutationType.SET_FILELOADING, boolean>
    | StateMutation<StateMutationType.SET_RESULTLOADING, { key: number, value: boolean }>
    | StateMutation<StateMutationType.SET_RESULT, Result | undefined>
    | StateMutation<StateMutationType.SET_CHUNKSNUMBER, number>
    | StateMutation<StateMutationType.SET_FILE, File>
    | StateMutation<StateMutationType.SET_CSVPARSINGFINISHED, boolean>
    | StateMutation<StateMutationType.RESET_STATE, undefined>
    | StateMutation<StateMutationType.SET_CURRENTCHART, [string, string]>
    | StateMutation<StateMutationType.SET_CURRENTEVENT, string>
    | StateMutation<StateMutationType.SET_CURRENTMULTIPLEEVENT, [string, string]>
    | StateMutation<StateMutationType.SET_CURRENTPIPELINE, Array<string>>
    | StateMutation<StateMutationType.SET_CURRENTOPERATOR, Array<string>>
    | StateMutation<StateMutationType.SET_CURRENTREQUEST, RestQueryType>
    | StateMutation<StateMutationType.SET_EVENTS, Array<string>>
    | StateMutation<StateMutationType.SET_PIPELINES, Array<string>>
    | StateMutation<StateMutationType.SET_OPERATORS, Array<string>>
    | StateMutation<StateMutationType.SET_KPIS, Array<IKpiData>>
    | StateMutation<StateMutationType.SET_CHARTIDCOUNTER, number>
    | StateMutation<StateMutationType.SET_CHARTDATA, ChartDataKeyValue>
    | StateMutation<StateMutationType.SET_DASHBOARDSTATE, IDashboardState>
    | StateMutation<StateMutationType.SET_CURRENTINTERPOLATION, String>
    | StateMutation<StateMutationType.SET_CURRENTBUCKETSIZE, number>
    | StateMutation<StateMutationType.SET_CURRENTTIMEBUCKETSELECTIONTUPLE, [number, number]>
    | StateMutation<StateMutationType.SET_CURRENTTIMEPOSITIONSELECTIONTUPLE, [number, number]>
    | StateMutation<StateMutationType.SET_CURRENTVIEW, ViewType>
    | StateMutation<StateMutationType.SET_QUERYPLAN, object>
    ;

// The action dispatch
export type Dispatch = (mutation: StateMutationVariant) => void;
/// Mutation of the application state
export class AppStateMutation {
    public static reduce(state: AppState, mutation: StateMutationVariant): AppState {
        switch (mutation.type) {
            case StateMutationType.SET_FILELOADING:
                return {
                    ...state,
                    fileLoading: mutation.data,
                };
            case StateMutationType.SET_RESULTLOADING:
                return {
                    ...state,
                    resultLoading: { ...state.resultLoading, [mutation.data.key]: mutation.data.value },
                };
            case StateMutationType.SET_RESULT:
                return {
                    ...state,
                    result: mutation.data,
                };
            case StateMutationType.SET_CHUNKSNUMBER:
                return {
                    ...state,
                    chunksNumber: mutation.data,
                };
            case StateMutationType.SET_FILE:
                return {
                    ...state,
                    file: mutation.data,
                };
            case StateMutationType.SET_CSVPARSINGFINISHED:
                return {
                    ...state,
                    csvParsingFinished: mutation.data,
                };
            case StateMutationType.SET_CURRENTCHART:
                return {
                    ...state,
                    currentChart: mutation.data[0],
                    currentChartReadableName: mutation.data[1],
                };
            case StateMutationType.SET_CURRENTEVENT:
                return {
                    ...state,
                    currentEvent: mutation.data,
                };
            case StateMutationType.SET_CURRENTMULTIPLEEVENT:
                return {
                    ...state,
                    currentMultipleEvent: mutation.data,
                };
            case StateMutationType.SET_CURRENTPIPELINE:
                return {
                    ...state,
                    currentPipeline: mutation.data,
                };
            case StateMutationType.SET_CURRENTOPERATOR:
                return {
                    ...state,
                    currentOperator: mutation.data,
                };
            case StateMutationType.SET_CURRENTREQUEST:
                return {
                    ...state,
                    currentRequest: mutation.data,
                };
            case StateMutationType.SET_EVENTS:
                return {
                    ...state,
                    events: mutation.data,
                };
            case StateMutationType.SET_PIPELINES:
                return {
                    ...state,
                    pipelines: mutation.data,
                    pipelinesShort: mutation.data.map((elem, index) => (String.fromCharCode(97 + index))),
                };
            case StateMutationType.SET_OPERATORS:
                return {
                    ...state,
                    operators: mutation.data,
                };
            case StateMutationType.SET_KPIS:
                return {
                    ...state,
                    kpis: mutation.data,
                };
            case StateMutationType.SET_CHARTIDCOUNTER:
                return {
                    ...state,
                    chartIdCounter: mutation.data,
                };
            case StateMutationType.SET_CHARTDATA:
                return {
                    ...state,
                    chartData: mutation.data,
                };
            case StateMutationType.SET_DASHBOARDSTATE:
                return {
                    ...state,
                    dashboardState: mutation.data,
                }
            case StateMutationType.SET_CURRENTINTERPOLATION:
                return {
                    ...state,
                    currentInterpolation: mutation.data,
                }
            case StateMutationType.SET_CURRENTBUCKETSIZE:
                return {
                    ...state,
                    currentBucketSize: mutation.data,
                }
            case StateMutationType.SET_CURRENTTIMEBUCKETSELECTIONTUPLE:
                return {
                    ...state,
                    currentTimeBucketSelectionTuple: mutation.data,
                }
            case StateMutationType.SET_CURRENTTIMEPOSITIONSELECTIONTUPLE:
                return {
                    ...state,
                    currentTimePositionSelectionTuple: mutation.data,
                }
            case StateMutationType.SET_CURRENTVIEW:
                return {
                    ...state,
                    currentView: mutation.data,
                }
            case StateMutationType.SET_QUERYPLAN:
                return {
                    ...state,
                    queryPlan: mutation.data,
                }
            case StateMutationType.RESET_STATE:
                return {
                    fileLoading: false,
                    resultLoading: {},
                    result: undefined,
                    chunksNumber: 0,
                    csvParsingFinished: false,
                    file: undefined,
                    currentChart: "",
                    currentChartReadableName: "",
                    currentEvent: "Default",
                    currentMultipleEvent: "Default",
                    currentPipeline: "All",
                    currentOperator: "All",
                    currentRequest: undefined,
                    events: undefined,
                    pipelines: undefined,
                    pipelinesShort: undefined,
                    operators: undefined,
                    kpis: undefined,
                    chartIdCounter: 1,
                    chartData: {},
                    dashboardState: undefined,
                    currentInterpolation: "basis",
                    currentBucketSize: 1,
                    currentTimeBucketSelectionTuple: [-1, -1],
                    currentTimePositionSelectionTuple: [-1, -1],
                    currentView: ViewType.UPLOAD,
                    queryPlan: undefined,
                }
        }
    }
}
