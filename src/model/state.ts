import {  ChartDataKeyValue } from "./chart_data_result";
import { Result, ResultLoading } from "./core_result";
import { RestQueryType } from "./rest_queries";
import {State as IDashboardState} from "../components/dashboard"

export interface AppState {
    /// The registered files
    fileName: string | undefined;
    fileLoading: boolean;
    resultLoading: ResultLoading;
    result: Result | undefined;
    chunksNumber: number;
    csvParsingFinished: boolean;
    file: undefined | File;
    currentChart: string;
    currentEvent: string;
    currentPipeline: Array<string> |undefined;
    currentRequest: RestQueryType | undefined;
    events: Array<string> |undefined;
    pipelines: Array<string> |undefined;
    chartIdCounter: number;
    chartData: ChartDataKeyValue;
    multipleChartDataLength: number;
    dashboardState: IDashboardState | undefined;
    currentInterpolation: String;
    currentBucketSize: number;
    currentTimeBucketSelectionTuple: [number, number];
}

export function createDefaultState(): AppState {
    return {
        fileName: undefined,
        fileLoading: false,
        resultLoading: {},
        result: undefined,
        chunksNumber: 0,
        csvParsingFinished: false,
        file: undefined,
        currentChart: "",
        currentEvent: "",
        currentPipeline: undefined,
        currentRequest: undefined,
        events: undefined,
        pipelines: undefined,
        chartIdCounter: 0,
        chartData: {},
        multipleChartDataLength: -1,
        dashboardState: undefined,
        currentInterpolation: "basis",
        currentBucketSize: 1,
        currentTimeBucketSelectionTuple: [0, Number.POSITIVE_INFINITY],
    };
}