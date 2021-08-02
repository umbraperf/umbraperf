/* eslint-env worker */

import * as profiler_core from '../crate/pkg/shell';

export enum WorkerRequestType {
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
  WorkerRequest<WorkerRequestType.TEST, string>;


export interface IRequestWorker {
  postMessage: (answerMessage: string) => void;
  onmessage: (message: MessageEvent<WorkerRequestVariant>) => void;
}

/*   interface IResponseWorker {
    postMessage: (message: TResponse) => void;
    onmessage: (message: MessageEvent<model.WorkerRequestVariant>) => void;
  } */

// const worker: IResponseWorker = self as any;

const worker: IRequestWorker = self as any;

console.log("I WAS AT THE NEW WORKER");

// Receive from the main thread

worker.onmessage = (message) => {

  console.log(message);

  if (!message.type) return;

  const messageType = message.data.type;
  const messageData = message.data.data;

  switch (messageType) {

    case WorkerRequestType.REGISTER_FILE:
      console.log("REGISTER FILE");
      console.log(messageData);

      profiler_core.triggerScanFile(this);
      break;
   
      case WorkerRequestType.TEST:
      console.log(messageData);
      break;
   
      default:
      console.log(`UNKNOWN REQUEST TYPE ${messageType}`);
  }

  // Send to the main thread
  //worker.postMessage("answer from worker!");
};