import { Result } from "./core_result";
import { SqlQueries } from "./sql_queries";

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
    currentRequest: SqlQueries | undefined;
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
    };
}