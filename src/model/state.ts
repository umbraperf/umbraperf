import { BackendQueryType, ProfileType, ChartDataKeyValue, IKpiData, Result, ResultLoading, ProfileVariant, createProfiles  } from ".";
import { ViewType, ChartTypeReadable, ChartType } from "./chart_types";

export interface AppState {
    /// The registered files
    fileLoading: boolean;
    resultLoading: ResultLoading;
    result: Result | undefined;
    chunksNumber: number;
    csvParsingFinished: boolean;
    file: undefined | File;
    currentChart: Array<ChartType>;
    loadingChartReadableName: Array<ChartTypeReadable>;
    currentEvent: string | "Default";
    currentMultipleEvent: [string, string] | "Default";
    currentPipeline: Array<string> | "All";
    currentOperator: Array<string> | "All";
    currentOperatorTimeframe: Array<string> | "All";
    currentRequest: BackendQueryType | undefined;
    events: Array<string> | undefined;
    pipelines: Array<string> | undefined;
    pipelinesShort: Array<string> | undefined;
    operators: Array<string> | undefined;
    physicalOperators: Array<string> | undefined;
    kpis: Array<IKpiData> | undefined;
    chartIdCounter: number;
    chartData: ChartDataKeyValue;
    currentInterpolation: String;
    currentBucketSize: number;
    currentTimeBucketSelectionTuple: [number, number];
    currentTimePositionSelectionTuple: [number, number];
    currentView: ViewType;
    memoryHeatmapsDifferenceRepresentation: boolean;
    currentProfile: ProfileType;
    profiles: Array<ProfileVariant>;
}

export function createDefaultState(): AppState {
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
        currentOperator: "All",
        currentOperatorTimeframe: "All",
        currentRequest: undefined,
        events: undefined,
        pipelines: undefined,
        pipelinesShort: undefined,
        operators: undefined,
        physicalOperators: undefined,
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
    };
}