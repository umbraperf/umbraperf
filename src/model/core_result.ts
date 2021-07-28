export interface Result {
    request: string;
    x: Array<any> | undefined;
    y?: Array<any> | undefined;
    z?: Array<any> | undefined;
}

export function createDefaultResult(): Result {
    return {
        request: "",
        x: [],
        y: [],
        z: [],
    };
}