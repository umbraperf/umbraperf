import { BackendQueryType, ProfileType, IChartDataKeyValue, IKpiData, IResult, IResultLoading, ProfileVariant, createProfiles, IOperatorsData } from ".";
import { ViewType, ChartTypeReadable, ChartType } from "./chart_types";

export interface AppState {
    fileLoading: boolean;
    resultLoading: IResultLoading;
    result: IResult | undefined;
    chunksNumber: number;
    umbraperfFileParsingFinished: boolean;
    file: undefined | File;
    queryplanJson: object | undefined;
    currentChart: Array<ChartType>;
    loadingChartReadableName: Array<ChartTypeReadable>;
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
    chartIdCounter: number;
    chartData: IChartDataKeyValue;
    currentInterpolation: String;
    currentBucketSize: number;
    currentTimeBucketSelectionTuple: [number, number];
    currentTimePositionSelectionTuple: [number, number];
    currentMemoryAddressSelectionTuple: [number, number];
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
        chunksNumber: 0,
        umbraperfFileParsingFinished: false,
        queryplanJson: undefined,
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
        currentMemoryAddressSelectionTuple: [-1, -1],
        currentView: ViewType.UPLOAD,
        memoryHeatmapsDifferenceRepresentation: true,
        currentProfile: ProfileType.OVERVIEW,
        profiles: createProfiles(),
        currentAbsoluteSwimLaneMaxYDomain: 0,
    };
}