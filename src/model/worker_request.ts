/* export enum WorkerRequestType {
    REGISTER_FILE = 'REGISTER_FILE',
    TEST = 'TEST',
};

export type WorkerRequest<T, P> = {
    readonly messageId: number;
    readonly type: T;
    readonly data: P;
};

export type WorkerResponse<T, P> = {
    readonly messageId: number;
    readonly requestId: number;
    readonly type: T;
    readonly data: P;
};

export type WorkerRequestVariant =
    WorkerRequest<WorkerRequestType.REGISTER_FILE, File> |
    WorkerRequest<WorkerRequestType.TEST, string>; */