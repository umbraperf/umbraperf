export interface AppState {
    /// The registered files
    helloworld: string;
}

export function createDefaultState(): AppState {
    return {
        helloworld: "fooo",
    };
}