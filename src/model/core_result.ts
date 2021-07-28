export interface Result {
    request: string;
    x: Array<any> | undefined;
    y?: Array<any> | undefined;
    z?: Array<any> | undefined;
}

export function createResultObject(request: string, x: Array<any>, y?: Array<any>, z?: Array<any>): Result {
    return {
        request: request,
        x: x,
        y: y,
        z: z,
    };
}