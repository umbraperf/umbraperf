export interface Result {
    request: number;
    x: Array<any> | undefined;
    y?: Array<any> | undefined;
    z?: Array<any> | undefined;
    test: number | undefined;
}

export function createResultObject(test: number, request: number, x: Array<any>, y?: Array<any>, z?: Array<any>): Result {
    return {
        request: request,
        x: x,
        y: y,
        z: z,
        test: test,
    };
}