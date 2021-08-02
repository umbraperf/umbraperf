/* eslint-env worker */

import * as profiler_core from '../crate/pkg/shell';

export enum WorkerRequestType {
  REGISTER_FILE = 'REGISTER_FILE',
  READ_CHUNK = 'READ_CHUNK',
  TEST = 'TEST',
};

export enum WorkerResponseType {
  SENT_UINT8 = 'SENT_UINT8'
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
  WorkerRequest<WorkerRequestType.READ_CHUNK, { offset: number, chunkSize: number }> |
  WorkerRequest<WorkerRequestType.TEST, string>;

export type WorkerResponseVariant =
  WorkerResponse<WorkerResponseType.SENT_UINT8, Uint8Array>;


export interface IRequestWorker {
  postMessage: (answerMessage: WorkerResponseVariant) => void;
  onmessage: (message: MessageEvent<WorkerRequestVariant>) => void;
}

interface IRegisteredFile {
  file: File | undefined,
  size: number | undefined,
}

const worker: IRequestWorker = self as any;
let registeredFile: IRegisteredFile = {
  file: undefined,
  size: undefined,
};

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
      registeredFile = {
        file: messageData as File,
        size: (messageData as File).size,
      }

      profiler_core.triggerScanFile(this);
      break;

    case WorkerRequestType.READ_CHUNK:
      if (registeredFile.file) {
        console.log(`Read Chunk at ${(messageData as any).offset}`)
        console.log(registeredFile);

        const offset = (messageData as any).offset;
        const chunkSize = (messageData as any).chunkSize;
        const file = registeredFile.file;
        const remainingFileSize = file.size - offset;

        let chunk = undefined;

        if (remainingFileSize > 0) {
          const readPart = Math.min(remainingFileSize, chunkSize);
          chunk = file.slice(offset, offset + readPart);

          const reader = new FileReaderSync();
          const arrayBufferChunk = reader.readAsArrayBuffer(chunk);
          const uInt8ArrayChunk = new Uint8Array(arrayBufferChunk!);

          console.log(uInt8ArrayChunk);

          worker.postMessage({
            //TODO message IDs, counter for request IDs
            messageId: 201,
            requestId: 201,
            type: WorkerResponseType.SENT_UINT8,
            data: uInt8ArrayChunk,
          });
        }
      }
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