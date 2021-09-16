import * as model from '../model';
import { AppState } from './state';
import { Result } from "./core_result";
import { RestQueryType } from './rest_queries';
import { ChartDataKeyValue } from './chart_data_result';
import {State as IDashboardState} from "../components/dashboard"



/// A mutation
export type StateMutation<T, P> = {
    readonly type: T;
    readonly data: P;
};

/// A mutation type
export enum StateMutationType {
    SET_FILENAME = 'SET_FILENAME',
    SET_RESULTLOADING = 'SET_RESULTLOADING',
    SET_RESULT = 'SET_RESULT',
    SET_CHUNKSNUMBER = 'SET_CHUNKSNUMBER',
    SET_FILE = 'SET_FILE',
    SET_CSVPARSINGFINISHED = 'SET_CSVPARSINGFINISHED',
    RESET_STATE = 'RESET_STATE',
    SET_CURRENTCHART = 'SET_CURRENTCHART',
    SET_CURRENTEVENT = 'SET_CURRENTEVENT',
    SET_CURRENTPIPELINE = 'SET_CURRENTPIPELINE',
    SET_CURRENTREQUEST = 'SET_CURRENTREQUEST',
    SET_EVENTS = 'SET_EVENTS',
    SET_PIPELINES = 'SET_PIPELINES',
    SET_CHARTIDCOUNTER = 'SET_CHARTIDCOUNTER',
    SET_CHARTDATA = 'SET_CHARTDATA',
    SET_MULTIPLECHARTDATALENGTH = 'SET_MULTIPLECHARTDATALENGTH',
    SET_DASHBOARDSTATE = 'SET_DASHBOARDSTATE',
    OTHER = 'OTHER',
}

/// An state mutation variant
export type StateMutationVariant =
    | StateMutation<StateMutationType.SET_FILENAME, string>
    | StateMutation<StateMutationType.SET_RESULTLOADING, boolean>
    | StateMutation<StateMutationType.SET_RESULT, Result | undefined>
    | StateMutation<StateMutationType.SET_CHUNKSNUMBER, number>
    | StateMutation<StateMutationType.SET_FILE, File>
    | StateMutation<StateMutationType.SET_CSVPARSINGFINISHED, boolean>
    | StateMutation<StateMutationType.RESET_STATE, undefined>
    | StateMutation<StateMutationType.SET_CURRENTCHART, string>
    | StateMutation<StateMutationType.SET_CURRENTEVENT, string>
    | StateMutation<StateMutationType.SET_CURRENTPIPELINE, string>
    | StateMutation<StateMutationType.SET_CURRENTREQUEST, RestQueryType>
    | StateMutation<StateMutationType.SET_EVENTS, Array<string>>
    | StateMutation<StateMutationType.SET_PIPELINES, Array<string>>
    | StateMutation<StateMutationType.SET_CHARTIDCOUNTER, number>
    | StateMutation<StateMutationType.SET_CHARTDATA, ChartDataKeyValue>
    | StateMutation<StateMutationType.SET_MULTIPLECHARTDATALENGTH, number>
    | StateMutation<StateMutationType.SET_DASHBOARDSTATE, IDashboardState>
    ;

// The action dispatch
export type Dispatch = (mutation: StateMutationVariant) => void;
/// Mutation of the application state
export class AppStateMutation {
    public static reduce(state: AppState, mutation: StateMutationVariant): AppState {
        switch (mutation.type) {
            case StateMutationType.SET_FILENAME:
                return {
                    ...state,
                    fileName: mutation.data,
                };
            case StateMutationType.SET_RESULTLOADING:
                return {
                    ...state,
                    resultLoading: mutation.data,
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
                    currentChart: mutation.data,
                };
            case StateMutationType.SET_CURRENTEVENT:
                return {
                    ...state,
                    currentEvent: mutation.data,
                };
            case StateMutationType.SET_CURRENTPIPELINE:
                return {
                    ...state,
                    currentPipeline: mutation.data,
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
            case StateMutationType.SET_MULTIPLECHARTDATALENGTH:
                return {
                    ...state,
                    multipleChartDataLength: mutation.data,
                }
            case StateMutationType.SET_DASHBOARDSTATE:
                return {
                    ...state,
                    dashboardState: mutation.data,
                }
            case StateMutationType.RESET_STATE:
                return {
                    fileName: undefined,
                    resultLoading: false,
                    result: undefined,
                    chunksNumber: 0,
                    csvParsingFinished: false,
                    file: undefined,
                    currentChart: "",
                    currentEvent: "",
                    currentPipeline: "",
                    currentRequest: undefined,
                    events: undefined,
                    pipelines: undefined,
                    chartIdCounter: 0,
                    chartData: {},
                    multipleChartDataLength: -1,
                    dashboardState: undefined,
                }
        }
    }
}
