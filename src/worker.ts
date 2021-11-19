/* eslint-env worker */

import * as profiler_core from '../crate/pkg/shell';
import * as RestApi from './model/backend_queries';
import * as JSZip from '../node_modules/jszip/';

//worker responses:

export enum WorkerResponseType {
  CSV_READING_FINISHED = 'CSV_READING_FINISHED',
  STORE_RESULT = 'STORE_RESULT',
  STORE_QUERYPLAN = 'STORE_QUERYPLAN',
};

export type WorkerResponse<T, P> = {
  readonly type: T;
  readonly data: P;
  readonly messageId: number;
};

export interface IStoreResultResponseData {
  requestId: number,
  chartData: any,
  restQueryType: RestApi.BackendQueryType,
  metaRequest: boolean,
}

export type WorkerResponseVariant =
  WorkerResponse<WorkerResponseType.CSV_READING_FINISHED, number> |
  WorkerResponse<WorkerResponseType.STORE_RESULT, IStoreResultResponseData> |
  WorkerResponse<WorkerResponseType.STORE_QUERYPLAN, Object>
  ;


//worker requests:

export enum WorkerRequestType {
  REGISTER_FILE = 'REGISTER_FILE',
  CALCULATE_CHART_DATA = 'CALCULATE_CHART_DATA',
  TEST = 'TEST',
};

export type WorkerRequest<T, P> = {
  readonly messageId: number;
  readonly type: T;
  readonly data: P;
};

export interface ICalculateChartDataRequestData {
  readonly requestId: number | undefined;
  readonly restQuery: string,
  readonly metaRequest: boolean,
  readonly restQueryType: RestApi.BackendQueryType;
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
let globalRestQueryType: RestApi.BackendQueryType | undefined = undefined;

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

function extractQueryPlanFromZip(file: File) {
  JSZip.loadAsync(file).then(function (umbraperfArchiv: any) {
    const queryPlanFile = umbraperfArchiv.files["query_plan.json"];
    if (undefined === queryPlanFile) {
      worker.postMessage({
        messageId: 201,
        type: WorkerResponseType.STORE_QUERYPLAN,
        data: { "error": "no queryplan" },
      });
    } else {
      queryPlanFile.async('string').then(
        function (queryPlanFileData: any) {
          const queryPlanFileDataJson = JSON.parse(queryPlanFileData);
          worker.postMessage({
            messageId: 201,
            type: WorkerResponseType.STORE_QUERYPLAN,
            data: queryPlanFileDataJson,
          });
        },
      )
    }
  })

}


export function notifyJsFinishedReading(registeredFileId: number) {
  worker.postMessage({
    messageId: 201,
    type: WorkerResponseType.CSV_READING_FINISHED,
    data: registeredFileId,
  });

}

export function notifyJsQueryResult(result: any) {

  if (result) {
    worker.postMessage({
      messageId: 201,
      type: WorkerResponseType.STORE_RESULT,
      data: {
        requestId: globalRequestId!,
        chartData: result,
        restQueryType: globalRestQueryType!,
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

      globalFileDictionary[globalFileIdCounter] = messageData as File;
      profiler_core.analyzeFile(globalFileDictionary[globalFileIdCounter].size);
      extractQueryPlanFromZip(globalFileDictionary[globalFileIdCounter]);
      globalFileIdCounter++;
      break;

    case WorkerRequestType.CALCULATE_CHART_DATA:
      globalRequestId = (messageData as ICalculateChartDataRequestData).requestId;
      globalMetaRequest = (messageData as ICalculateChartDataRequestData).metaRequest;
      globalRestQueryType = (messageData as ICalculateChartDataRequestData).restQueryType;
      profiler_core.requestChartData((messageData as ICalculateChartDataRequestData).restQuery);
      break;

    default:
  }

};
