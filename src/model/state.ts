export interface AppState {
    /// The registered files
    helloworld: string;
    fileName: string | undefined;
    result: string;
}

export function createDefaultState(): AppState {
    return {
        helloworld: "fooo2",
        fileName: undefined,
        result: "no result",
    };
}