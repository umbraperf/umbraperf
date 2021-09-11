/* eslint-env worker */

import * as profiler_core from '../crate/pkg/shell';

export enum WorkerRequestType {
  REGISTER_FILE = 'REGISTER_FILE',
  CALCULATE_CHART_DATA = 'CALCULATE_CHART_DATA',
  TEST = 'TEST',
};

export enum WorkerResponseType {
  CSV_READING_FINISHED = 'CSV_READING_FINISHED',
  STORE_RESULT = 'STORE_RESULT',
  REGISTERED_FILE = 'REGISTERED_FILE',
};

export type WorkerRequest<T, P> = {
  readonly messageId: number;
  readonly type: T;
  readonly data: P;
};

export type WorkerResponse<T, P> = {
  readonly messageId: number;
  readonly requestId: number | undefined;
  readonly type: T;
  readonly data: P;
  readonly eventsRequest: boolean;
};

export interface ICalculateChartDataRequestData{
  queryMetadata: string,
  sqlQuery: string,
  requestId: number,
  eventsRequest: boolean,
}

export interface IStoreResultResponseData{
  messageId: number;
  requestId: number|undefined;
  type: WorkerResponseType;
  data: any;
}

export type WorkerRequestVariant =
  WorkerRequest<WorkerRequestType.REGISTER_FILE, File> |
  WorkerRequest<WorkerRequestType.CALCULATE_CHART_DATA, ICalculateChartDataRequestData>
  ;

export type WorkerResponseVariant =
  WorkerResponse<WorkerResponseType.CSV_READING_FINISHED, any> |
  WorkerResponse<WorkerResponseType.STORE_RESULT, IStoreResultResponseData> |
  WorkerResponse<WorkerResponseType.REGISTERED_FILE, string>
  ;


export interface IRequestWorker {
  postMessage: (answerMessage: WorkerResponseVariant) => void;
  onmessage: (message: MessageEvent<WorkerRequestVariant>) => void;
}


interface IGlobalFileDictionary {
  [key: number]: File;
}

let globalFileIdCounter = 0;
let globalEventsRequest: boolean;
let globalFileDictionary: IGlobalFileDictionary = {}
let globalRequestId: number|undefined = undefined;

const worker: IRequestWorker = self as any;

interface IRegisteredFile {
  file: File | undefined,
  size: number | undefined,
}
let registeredFile: IRegisteredFile = {
  file: undefined,
  size: undefined,
};

export function readFileChunk(offset: number, chunkSize: number) {

  if (globalFileDictionary[0]) {
    const file = globalFileDictionary[0];
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


export function notifyJsFinishedReading(requestId: number) {
  worker.postMessage({
    messageId: 201,
    requestId: 100,
    type: WorkerResponseType.CSV_READING_FINISHED,
    data: requestId,
    eventsRequest: false,
  });

}

export function notifyJsQueryResult(result: any) {

  if (result) {
    worker.postMessage({
      messageId: 201,
      requestId: globalRequestId,
      type: WorkerResponseType.STORE_RESULT,
      data: result,
      eventsRequest: globalEventsRequest,
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

      globalFileDictionary[globalFileIdCounter] = messageData as File;

      //TODO: add file id to rust request
      profiler_core.analyzeFile(globalFileDictionary[globalFileIdCounter].size);

      globalFileIdCounter++;
      break;

    case WorkerRequestType.CALCULATE_CHART_DATA:
      globalRequestId = (messageData as ICalculateChartDataRequestData).requestId;
      globalEventsRequest = (messageData as ICalculateChartDataRequestData).eventsRequest;
      profiler_core.requestChartData((messageData as ICalculateChartDataRequestData).sqlQuery, (messageData as ICalculateChartDataRequestData).queryMetadata);
      break;

    default:
  }

};
