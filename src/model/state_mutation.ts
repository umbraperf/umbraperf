import { AppState, createProfiles, ProfileType, IKpiData, IResult, BackendQueryType, IChartDataKeyValue, ViewType, ChartType, ChartTypeReadable, IOperatorsData } from '.';

/// A mutation
export type StateMutation<T, P> = {
    readonly type: T;
    readonly data: P;
};

/// A mutation type
export enum StateMutationType {
    SET_FILE_LOADING = 'SET_FILE_LOADING',
    SET_RESULT_LOADING = 'SET_RESULT_LOADING',
    SET_RESULT = 'SET_RESULT',
    SET_FILE = 'SET_FILE',
    SET_CSV_PARSING_FINISHED = 'SET_CSV_PARSING_FINISHED',
    SET_RESET_STATE = 'SET_RESET_STATE',
    SET_CURRENT_CHART = 'SET_CURRENT_CHART',
    SET_LOADING_CHART_READABLE_NAME = 'SET_LOADING_CHART_READABLE_NAME',
    SET_CURRENT_EVENT = 'SET_CURRENT_EVENT',
    SET_CURRENT_MULTIPLE_EVENT = 'SET_CURRENT_MULTIPLE_EVENT',
    SET_CURRENT_PIPELINE = 'SET_CURRENT_PIPELINE',
    SET_CURRENT_PIPELINE_ACTIVE_TIMEFRAME = 'SET_CURRENT_PIPELINE_ACTIVE_TIMEFRAME',
    SET_CURRENT_OPERATOR = 'SET_CURRENT_OPERATOR',
    SET_CURRENT_OPERATOR_ACTIVE_TIMEFRAME_PIPELINE = 'SET_CURRENT_OPERATOR_ACTIVE_TIMEFRAME_PIPELINE',
    SET_CURRENT_REQUEST = 'SET_CURRENT_REQUEST',
    SET_EVENTS = 'SET_EVENTS',
    SET_PIPELINES = 'SET_PIPELINES',
    SET_OPERATORS = 'SET_OPERATORS',
    SET_KPIS = 'SET_KPIS',
    SET_CHART_ID_COUNTER = 'SET_CHART_ID_COUNTER',
    SET_CHART_DATA = 'SET_CHART_DATA',
    SET_CURRENT_INTERPOLATION = 'SET_CURRENT_INTERPOLATION',
    SET_CURRENT_BUCKETSIZE = 'SET_CURRENT_BUCKETSIZE',
    SET_CURRENT_TIME_BUCKET_SELECTION_TUPLE = 'SET_CURRENT_TIME_BUCKET_SELECTION_TUPLE',
    SET_CURRENT_TIME_POSITION_SELECTION_TUPLE = 'SET_CURRENT_TIME_POSITION_SELECTION_TUPLE',
    SET_CURRENT_VIEW = 'SET_CURRENT_VIEW',
    SET_QUERYPLAN = 'SET_QUERYPLAN',
    SET_MEMORY_HEATMAPS_DIFFERENCE_REPRESENTATION = 'SET_MEMORY_HEATMAPS_DIFFERENCE_REPRESENTATION',
    SET_CURRENT_PROFILE = 'SET_CURRENT_PROFILE',
    OTHER = 'OTHER',
}

/// An state mutation variant
export type StateMutationVariant =
    | StateMutation<StateMutationType.SET_FILE_LOADING, boolean>
    | StateMutation<StateMutationType.SET_RESULT_LOADING, { key: number, value: boolean }>
    | StateMutation<StateMutationType.SET_RESULT, IResult | undefined>
    | StateMutation<StateMutationType.SET_FILE, File>
    | StateMutation<StateMutationType.SET_CSV_PARSING_FINISHED, boolean>
    | StateMutation<StateMutationType.SET_RESET_STATE, undefined>
    | StateMutation<StateMutationType.SET_CURRENT_CHART, ChartType>
    | StateMutation<StateMutationType.SET_LOADING_CHART_READABLE_NAME, ChartType>
    | StateMutation<StateMutationType.SET_CURRENT_EVENT, string>
    | StateMutation<StateMutationType.SET_CURRENT_MULTIPLE_EVENT, [string, string]>
    | StateMutation<StateMutationType.SET_CURRENT_PIPELINE, Array<string>>
    | StateMutation<StateMutationType.SET_CURRENT_PIPELINE_ACTIVE_TIMEFRAME, Array<string>>
    | StateMutation<StateMutationType.SET_CURRENT_OPERATOR, Array<string>>
    | StateMutation<StateMutationType.SET_CURRENT_OPERATOR_ACTIVE_TIMEFRAME_PIPELINE, Array<string>>
    | StateMutation<StateMutationType.SET_CURRENT_REQUEST, BackendQueryType>
    | StateMutation<StateMutationType.SET_EVENTS, Array<string>>
    | StateMutation<StateMutationType.SET_PIPELINES, Array<string>>
    | StateMutation<StateMutationType.SET_OPERATORS, IOperatorsData>
    | StateMutation<StateMutationType.SET_KPIS, Array<IKpiData>>
    | StateMutation<StateMutationType.SET_CHART_ID_COUNTER, number>
    | StateMutation<StateMutationType.SET_CHART_DATA, IChartDataKeyValue>
    | StateMutation<StateMutationType.SET_CURRENT_INTERPOLATION, String>
    | StateMutation<StateMutationType.SET_CURRENT_BUCKETSIZE, number>
    | StateMutation<StateMutationType.SET_CURRENT_TIME_BUCKET_SELECTION_TUPLE, [number, number]>
    | StateMutation<StateMutationType.SET_CURRENT_TIME_POSITION_SELECTION_TUPLE, [number, number]>
    | StateMutation<StateMutationType.SET_CURRENT_VIEW, ViewType>
    | StateMutation<StateMutationType.SET_MEMORY_HEATMAPS_DIFFERENCE_REPRESENTATION, boolean>
    | StateMutation<StateMutationType.SET_CURRENT_PROFILE, ProfileType>
    ;

// The action dispatch
export type Dispatch = (mutation: StateMutationVariant) => void;
/// Mutation of the application state
export class AppStateMutation {
    public static reduce(state: AppState, mutation: StateMutationVariant): AppState {
        switch (mutation.type) {
            case StateMutationType.SET_FILE_LOADING:
                return {
                    ...state,
                    fileLoading: mutation.data,
                };
            case StateMutationType.SET_RESULT_LOADING:
                return {
                    ...state,
                    resultLoading: { ...state.resultLoading, [mutation.data.key]: mutation.data.value },
                };
            case StateMutationType.SET_RESULT:
                return {
                    ...state,
                    result: mutation.data,
                };
            case StateMutationType.SET_FILE:
                return {
                    ...state,
                    file: mutation.data,
                };
            case StateMutationType.SET_CSV_PARSING_FINISHED:
                return {
                    ...state,
                    csvParsingFinished: mutation.data,
                };
            case StateMutationType.SET_CURRENT_CHART:
                return {
                    ...state,
                    currentChart: state.currentChart.concat([mutation.data]),
                };
            case StateMutationType.SET_LOADING_CHART_READABLE_NAME:
                return {
                    ...state,
                    loadingChartReadableName: state.loadingChartReadableName.concat([ChartTypeReadable[mutation.data]]),
                };
            case StateMutationType.SET_CURRENT_EVENT:
                return {
                    ...state,
                    currentEvent: mutation.data,
                };
            case StateMutationType.SET_CURRENT_MULTIPLE_EVENT:
                return {
                    ...state,
                    currentMultipleEvent: mutation.data,
                };
            case StateMutationType.SET_CURRENT_PIPELINE:
                return {
                    ...state,
                    currentPipeline: mutation.data,
                };
            case StateMutationType.SET_CURRENT_PIPELINE_ACTIVE_TIMEFRAME:
                return {
                    ...state,
                    currentPipelineActiveTimeframe: mutation.data,
                };
            case StateMutationType.SET_CURRENT_OPERATOR:
                return {
                    ...state,
                    currentOperator: mutation.data,
                };
            case StateMutationType.SET_CURRENT_OPERATOR_ACTIVE_TIMEFRAME_PIPELINE:
                return {
                    ...state,
                    currentOperatorActiveTimeframePipeline: mutation.data,
                };
            case StateMutationType.SET_CURRENT_REQUEST:
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
            case StateMutationType.SET_CHART_ID_COUNTER:
                return {
                    ...state,
                    chartIdCounter: mutation.data,
                };
            case StateMutationType.SET_CHART_DATA:
                return {
                    ...state,
                    chartData: mutation.data,
                };
            case StateMutationType.SET_CURRENT_INTERPOLATION:
                return {
                    ...state,
                    currentInterpolation: mutation.data,
                }
            case StateMutationType.SET_CURRENT_BUCKETSIZE:
                return {
                    ...state,
                    currentBucketSize: mutation.data,
                }
            case StateMutationType.SET_CURRENT_TIME_BUCKET_SELECTION_TUPLE:
                return {
                    ...state,
                    currentTimeBucketSelectionTuple: mutation.data,
                }
            case StateMutationType.SET_CURRENT_TIME_POSITION_SELECTION_TUPLE:
                return {
                    ...state,
                    currentTimePositionSelectionTuple: mutation.data,
                }
            case StateMutationType.SET_CURRENT_VIEW:
                return {
                    ...state,
                    currentView: mutation.data,
                }
            case StateMutationType.SET_MEMORY_HEATMAPS_DIFFERENCE_REPRESENTATION:
                return {
                    ...state,
                    memoryHeatmapsDifferenceRepresentation: mutation.data,
                }
            case StateMutationType.SET_CURRENT_PROFILE:
                return {
                    ...state,
                    currentProfile: mutation.data,
                }
            case StateMutationType.SET_RESET_STATE:
                return {
                    fileLoading: false,
                    resultLoading: {},
                    result: undefined,
                    chunksNumber: 0,
                    csvParsingFinished: false,
                    file: undefined,
                    currentChart: [],
                    loadingChartReadableName: [],
                    currentEvent: "Default",
                    currentMultipleEvent: "Default",
                    currentPipeline: "All",
                    currentPipelineActiveTimeframe: "All",
                    currentOperator: "All",
                    currentOperatorActiveTimeframePipeline: "All",
                    currentRequest: undefined,
                    events: undefined,
                    pipelines: undefined,
                    pipelinesShort: undefined,
                    operators: undefined,
                    kpis: undefined,
                    chartIdCounter: 1,
                    chartData: {},
                    currentInterpolation: "basis",
                    currentBucketSize: 1,
                    currentTimeBucketSelectionTuple: [-1, -1],
                    currentTimePositionSelectionTuple: [-1, -1],
                    currentView: ViewType.UPLOAD,
                    memoryHeatmapsDifferenceRepresentation: true,
                    currentProfile: ProfileType.OVERVIEW,
                    profiles: createProfiles(),
                }
        }
    }
}
