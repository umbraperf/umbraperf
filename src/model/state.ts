export interface AppState {
    /// The registered files
    helloworld: string;
    fileName: string | undefined;
    resultLoading: boolean;
    result: string | undefined;
    chunksNumber: number;
}

export function createDefaultState(): AppState {
    return {
        helloworld: "fooo2",
        fileName: undefined,
        resultLoading: false,
        result: undefined,
        chunksNumber: 0,
    };
}