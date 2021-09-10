import { ChartData, ChartDataVariant } from "./chart_data_result";
import { Result } from "./core_result";
import { SqlQueryType } from "./sql_queries";

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
    currentRequest: SqlQueryType | undefined;
    events: Array<string> |undefined;
    chartIdCounter: number;
    chartData: Array<ChartDataVariant>;
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
        chartData: [],
    };
}