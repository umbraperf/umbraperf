import {  ChartDataKeyValue } from "./chart_data_result";
import { Result } from "./core_result";
import { RestQueryType } from "./rest_queries";
import {State as IDashboardState} from "../components/dashboard"

export interface AppState {
    /// The registered files
    fileName: string | undefined;
    resultLoading: boolean;
    result: Result | undefined;
    chunksNumber: number;
    csvParsingFinished: boolean;
    file: undefined | File;
    currentChart: string;
    currentEvent: string;
    currentRequest: RestQueryType | undefined;
    events: Array<string> |undefined;
    chartIdCounter: number;
    chartData: ChartDataKeyValue;
    multipleChartDataLength: number;
    dashboardState: IDashboardState | undefined;
}

export function createDefaultState(): AppState {
    return {
        fileName: undefined,
        resultLoading: false,
        result: undefined,
        chunksNumber: 0,
        csvParsingFinished: false,
        file: undefined,
        currentChart: "",
        currentEvent: "",
        currentRequest: undefined,
        events: undefined,
        chartIdCounter: 0,
        chartData: {},
        multipleChartDataLength: -1,
        dashboardState: undefined,
    };
}