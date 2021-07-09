export interface AppState {
    /// The registered files
    helloworld: string;
    fileName: string;
}

export function createDefaultState(): AppState {
    return {
        helloworld: "fooo2",
        fileName: "no file selected",
    };
}