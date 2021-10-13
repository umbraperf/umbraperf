import {  ChartDataKeyValue } from "./chart_data_result";
import { IKpiData, Result, ResultLoading } from "./core_result";
import { RestQueryType } from "./rest_queries";
import {State as IDashboardState} from "../components/dummy-dashboard"

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
    currentEvent: string | "Default";
    currentPipeline: Array<string> | "All";
    currentOperator: Array<string> | "All";
    currentRequest: RestQueryType | undefined;
    events: Array<string> |undefined;
    pipelines: Array<string> |undefined;
    operators: Array<string> | undefined;
    kpis: Array<IKpiData> | undefined;
    chartIdCounter: number;
    chartData: ChartDataKeyValue;
    multipleChartDataLength: number;
    //TODO remove:
    dashboardState: IDashboardState | undefined;
    currentInterpolation: String;
    currentBucketSize: number;
    currentTimeBucketSelectionTuple: [number, number];
    currentTimePositionSelectionTuple: [number, number];
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
        currentEvent: "Default",
        currentPipeline: "All",
        currentOperator: "All",
        currentRequest: undefined,
        events: undefined,
        pipelines: undefined,
        operators: undefined,
        kpis: undefined,
        chartIdCounter: 1,
        chartData: {},
        multipleChartDataLength: -1,
        dashboardState: undefined,
        currentInterpolation: "basis",
        currentBucketSize: 1,
        currentTimeBucketSelectionTuple: [-1, -1],
        currentTimePositionSelectionTuple: [-1, -1]

    };
}