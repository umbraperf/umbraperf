import { Result } from "./core_result";

export interface AppState {
    /// The registered files
    fileName: string | undefined;
    resultLoading: boolean;
    result: Result | undefined;
    chunksNumber: number;
    events: Array<string> | undefined;
    file: undefined | File;
}

export function createDefaultState(): AppState {
    return {
        fileName: undefined,
        resultLoading: false,
        result: undefined,
        chunksNumber: 0,
        events: undefined,
        file: undefined,
    };
}