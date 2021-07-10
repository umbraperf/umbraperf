export interface AppState {
    /// The registered files
    helloworld: string;
    fileName: string | undefined;
    result: string;
    chunksNumber: number;
}

export function createDefaultState(): AppState {
    return {
        helloworld: "fooo2",
        fileName: undefined,
        result: "no result",
        chunksNumber: 0,
    };
}