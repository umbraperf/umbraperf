import { Result } from "./core_result";

export interface AppState {
    /// The registered files
    helloworld: string;
    fileName: string | undefined;
    resultLoading: boolean;
    result: Result | undefined;
    chunksNumber: number;
    file: undefined | File;
}

export function createDefaultState(): AppState {
    return {
        helloworld: "fooo2",
        fileName: undefined,
        resultLoading: false,
        result: undefined,
        chunksNumber: 0,
        file: undefined,
    };
}