/* eslint-env worker */

import * as profiler_core from '../crate/pkg/shell';
import * as BackendApi from './model/backend_queries';


//worker responses:

export enum WorkerResponseType {
  UMBRAPERF_FILE_READING_FINISHED = 'UMBRAPERF_FILE_READING_FINISHED',
  STORE_RESULT = 'STORE_RESULT',
  STORE_QUERYPLAN_JSON = 'STORE_QUERYPLAN_JSON',
};

export type WorkerResponse<T, P> = {
  readonly type: T;
  readonly data: P;
  readonly messageId: number;
};

export interface IStoreResultResponseData {
  requestId: number,
  chartData: any,
  backendQueryType: BackendApi.BackendQueryType,
  metaRequest: boolean,
}

export interface IStoreQueryplanResponseData {
  queryPlanData: object,
}

export type WorkerResponseVariant =
  WorkerResponse<WorkerResponseType.UMBRAPERF_FILE_READING_FINISHED, number> |
  WorkerResponse<WorkerResponseType.STORE_RESULT, IStoreResultResponseData> |
  WorkerResponse<WorkerResponseType.STORE_QUERYPLAN_JSON, IStoreQueryplanResponseData>
  ;


//worker requests:

export enum WorkerRequestType {
  REGISTER_FILE = 'REGISTER_FILE',
  CALCULATE_CHART_DATA = 'CALCULATE_CHART_DATA',
};

export type WorkerRequest<T, P> = {
  readonly messageId: number;
  readonly type: T;
  readonly data: P;
};

export interface ICalculateChartDataRequestData {
  readonly requestId: number | undefined;
  readonly backendQuery: string,
  readonly metaRequest: boolean,
  readonly backendQueryType: BackendApi.BackendQueryType;
}

export type WorkerRequestVariant =
  WorkerRequest<WorkerRequestType.REGISTER_FILE, File> |
  WorkerRequest<WorkerRequestType.CALCULATE_CHART_DATA, ICalculateChartDataRequestData>
  ;


export interface IWorker {
  postMessage: (answerMessage: WorkerResponseVariant) => void;
  onmessage: (message: MessageEvent<WorkerRequestVariant>) => void;
}


interface IGlobalFileDictionary {
  [key: number]: File;
}

let globalFileIdCounter = 0;
let globalMetaRequest: boolean;
let globalFileDictionary: IGlobalFileDictionary = {}
let globalRequestId: number | undefined = undefined;
let globalBackendQueryType: BackendApi.BackendQueryType | undefined = undefined;

const worker: IWorker = self as any;


export function readFileChunk(offset: number, chunkSize: number) {

  if (globalFileDictionary[globalFileIdCounter]) {
    const file = globalFileDictionary[globalFileIdCounter];
    const remainingFileSize = file.size - offset;

    let chunk = undefined;

    if (remainingFileSize > 0) {
      const readPart = Math.min(remainingFileSize, chunkSize);
      chunk = file.slice(offset, offset + readPart);
      const reader = new FileReaderSync();
      const arrayBufferChunk = reader.readAsArrayBuffer(chunk);
      const uInt8ArrayChunk = new Uint8Array(arrayBufferChunk!);

      return uInt8ArrayChunk;
    }
  }
}

export function notifyJsFinishedReading(registeredFileId: number) {
  worker.postMessage({
    messageId: 201,
    type: WorkerResponseType.UMBRAPERF_FILE_READING_FINISHED,
    data: registeredFileId,
  });

}

export function notifyJsQueryPlan(queryplan: string) {
  let queryplanObject = {};
  if (queryplan) {
    queryplanObject = JSON.parse(queryplan);
  } else {
    queryplanObject = { "error": "no queryplan" };
  }
  worker.postMessage({
    messageId: 201,
    type: WorkerResponseType.STORE_QUERYPLAN_JSON,
    data: {
      queryPlanData: queryplanObject,
    },
  });
}

export function sendJsQueryResult(result: any) {

  if (result) {
    worker.postMessage({
      messageId: 201,
      type: WorkerResponseType.STORE_RESULT,
      data: {
        requestId: globalRequestId!,
        chartData: result,
        backendQueryType: globalBackendQueryType!,
        metaRequest: globalMetaRequest,
      },
    });
  }

}

// Receive from the main thread
worker.onmessage = (message) => {

  if (!message.type) return;

  const messageType = message.data.type;
  const messageData = message.data.data;

  switch (messageType) {

    case WorkerRequestType.REGISTER_FILE:

      globalFileIdCounter++;
      globalFileDictionary[globalFileIdCounter] = messageData as File;
      profiler_core.analyzeFile(globalFileDictionary[globalFileIdCounter].size);
      break;

    case WorkerRequestType.CALCULATE_CHART_DATA:
      globalRequestId = (messageData as ICalculateChartDataRequestData).requestId;
      globalMetaRequest = (messageData as ICalculateChartDataRequestData).metaRequest;
      globalBackendQueryType = (messageData as ICalculateChartDataRequestData).backendQueryType;
      profiler_core.requestChartData((messageData as ICalculateChartDataRequestData).backendQuery);
      break;

    default:
  }

};
