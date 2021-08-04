/* eslint-env worker */

import * as profiler_core from '../crate/pkg/shell';

export enum WorkerRequestType {
  REGISTER_FILE = 'REGISTER_FILE',
  READ_CHUNK = 'READ_CHUNK',
  TEST = 'TEST',
};

export enum WorkerResponseType {
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
  readonly requestId: number;
  readonly type: T;
  readonly data: P;
};

export type WorkerRequestVariant =
  WorkerRequest<WorkerRequestType.REGISTER_FILE, File> |
  WorkerRequest<WorkerRequestType.READ_CHUNK, { offset: number, chunkSize: number }> |
  WorkerRequest<WorkerRequestType.TEST, string>;

export type WorkerResponseVariant =
  WorkerResponse<WorkerResponseType.STORE_RESULT, number> |
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
let globalFileDictionary: IGlobalFileDictionary = {}

const worker: IRequestWorker = self as any;
console.log("I WAS AT THE NEW WORKER");

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

      console.log(uInt8ArrayChunk);

      return uInt8ArrayChunk;
    }
  }
}

function stroreResultFromRust(result: number) {

  worker.postMessage({
    //TODO message IDs, counter for request IDs
    messageId: 201,
    requestId: 201,
    type: WorkerResponseType.STORE_RESULT,
    data: result,
  });

}

// Receive from the main thread
worker.onmessage = (message) => {

  console.log("message:" + message);

  if (!message.type) return;

  const messageType = message.data.type;
  const messageData = message.data.data;

  switch (messageType) {

    case WorkerRequestType.REGISTER_FILE:
      console.log("REGISTER FILE");
      console.log(messageData);

      globalFileDictionary[globalFileIdCounter] = messageData as File;

      profiler_core.analyzeFile(globalFileDictionary[globalFileIdCounter].size);

      /*       //TODO remove
            registeredFile = {
              file: messageData as File,
              size: (messageData as File).size,
            } */


      //TODO remove
      worker.postMessage({
        messageId: 201,
        requestId: 201,
        type: WorkerResponseType.REGISTERED_FILE,
        data: globalFileDictionary[0].name,
      });

      globalFileIdCounter++;
      break;

    /*     case WorkerRequestType.READ_CHUNK:
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
          } */
    //break;

    case WorkerRequestType.TEST:
      console.log(messageData);
      break;

    default:
      console.log(`UNKNOWN REQUEST TYPE ${messageType}`);
  }

  // Send to the main thread
  //worker.postMessage("answer from worker!");
};
