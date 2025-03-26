import { BackendQueryType, ProfileType, IChartDataKeyValue, IKpiData, IResult, IResultLoading, ProfileVariant, createProfiles, IOperatorsData, HeatmapsOutlierDetectionDegrees, IKpiValuesFormated, IResultLoadingReadableName } from ".";
import { ViewType, ChartTypeReadable, ChartType } from "./chart_types";

export interface AppState {
    fileLoading: boolean;
    resultLoading: IResultLoading;
    result: IResult | undefined;
    umbraperfFileParsingFinished: boolean;
    file: File | undefined;
    queryplanJson: object | undefined;
    currentChart: Array<ChartType>;
    loadingChartReadableName: IResultLoadingReadableName; 
    currentEvent: string | "Default";
    currentMultipleEvent: [string, string] | "Default";
    currentPipeline: Array<string> | "All";
    currentPipelineActiveTimeframe: Array<string> | "All";
    currentOperator: Array<string> | "All";
    currentOperatorActiveTimeframePipeline: Array<string> | "All";
    currentRequest: BackendQueryType | undefined;
    events: Array<string> | undefined;
    pipelines: Array<string> | undefined;
    pipelinesShort: Array<string> | undefined;
    operators: IOperatorsData | undefined;
    kpis: Array<IKpiData> | undefined;
    kpiValuesFormated: IKpiValuesFormated;
    chartIdCounter: number;
    chartData: IChartDataKeyValue;
    currentInterpolation: string;
    currentBucketSize: number;
    currentTimeBucketSelectionTuple: [number, number];
    currentTimePositionSelectionTuple: [number, number];
    currentHeatmapsOutlierDetection: HeatmapsOutlierDetectionDegrees;
    currentView: ViewType;
    memoryHeatmapsDifferenceRepresentation: boolean;
    currentProfile: ProfileType;
    profiles: Array<ProfileVariant>;
    currentAbsoluteSwimLaneMaxYDomain: number;
}

export function createDefaultState(): AppState {
    return {
        fileLoading: false,
        resultLoading: {},
        result: undefined,
        umbraperfFileParsingFinished: false,
        queryplanJson: undefined,
        file: undefined,
        currentChart: [],
        loadingChartReadableName: {},
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
        kpiValuesFormated: {},
        chartIdCounter: 1,
        chartData: {},
        currentInterpolation: "basis",
        currentBucketSize: 1,
        currentTimeBucketSelectionTuple: [-1, -1],
        currentTimePositionSelectionTuple: [-1, -1],
        currentHeatmapsOutlierDetection: 0,
        currentView: ViewType.UPLOAD,
        memoryHeatmapsDifferenceRepresentation: true,
        currentProfile: ProfileType.OVERVIEW,
        profiles: createProfiles(),
        currentAbsoluteSwimLaneMaxYDomain: 0,
    };
}