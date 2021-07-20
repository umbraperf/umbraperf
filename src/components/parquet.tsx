import * as model from '../model';
import store from '../app';
import React from 'react';
import { connect } from 'react-redux';
import Dropzone, { DropzoneState, FileRejection } from 'react-dropzone'

import * as profiler_core from '../../crate/pkg/shell';

import styles from '../style/dummy.module.css';
import { CircularProgress } from '@material-ui/core';

interface Props {
    fileName: string | undefined;
    setFileName: (newFileName: string) => void;
    resultLoading: boolean;
    setResultLoading: (newResultLoading: boolean) => void;
    result: string | undefined;
    setResult: (newResult: string | undefined) => void;
    chunksNumber: number;
    setChunksNumber: (newChunksNumber: number) => void;
    file: File | undefined;
    setFile: (newFile: File) => void;
}

interface ChunkState {
    chunkNumber: number;
    setChunkNumber: (newChunkNumber: number) => void;
    remainingFileSize: undefined | number;
    setRemainingFileSize: (newRemainingFileSize: number) => void;
}

class Parquet extends React.Component<Props> {

    chunksState: ChunkState = {
        chunkNumber: 0,
        setChunkNumber: (newChunkNumber: number) => (this.chunksState.chunkNumber = newChunkNumber),
        remainingFileSize: undefined,
        setRemainingFileSize: (newRemainingFileSize: number) => (this.chunksState.remainingFileSize = newRemainingFileSize),
    }

    constructor(props: Props) {
        super(props);

        this.receiveFileOnDrop = this.receiveFileOnDrop.bind(this);
        this.awaitResultFromCore = this.awaitResultFromCore.bind(this);
        this.defineDropzoneStyle = this.defineDropzoneStyle.bind(this);
    }

    public async passNextToCore() {
        const currentChunk = this.chunksState.chunkNumber;
        const remainingFileSize = this.chunksState.remainingFileSize;
        const chunkSize = 4000;
        const offset = currentChunk * chunkSize;
        let chunk = undefined;
        if(remainingFileSize != undefined && remainingFileSize > 0 && this.props.file != undefined){
            const readHere = Math.min(remainingFileSize, chunkSize);
            chunk = this.props.file.slice(offset, offset + readHere);
            this.chunksState.setRemainingFileSize(remainingFileSize - readHere);
            const nextChunk = currentChunk + 1;
            this.chunksState.setChunkNumber(nextChunk);
        }
        const arrayBufferChunk = await chunk?.arrayBuffer();
        return new Uint8Array(arrayBufferChunk!);
    }

    public async passToMichael(files: Array<File>) {
        // const files = event.target.files;
        if (!files || files?.length == 0 || files![0] == null) return;
        const file = files[0];
        const fileSize = file.size;
        const chunkSize = 4000;
        console.log(fileSize);
        let remaining = fileSize;
        let offset = 0;
        const numberOfChunks = Math.ceil(fileSize / chunkSize);
        this.props.setChunksNumber(numberOfChunks);
        profiler_core.setExpectedChunks(numberOfChunks);

        while (remaining > 0) {
            const readHere = Math.min(remaining, chunkSize);
            let chunk = file.slice(offset, offset + readHere);
            const data = await chunk.arrayBuffer();
            profiler_core.consumeChunk(new Uint8Array(data));
            remaining -= readHere;
            offset += readHere;
        }
        console.log(numberOfChunks);
    }

    public async awaitResultFromCore() {
        if (this.props.fileName) {
            console.log(this.props.resultLoading);
            if (this.props.resultLoading) {
                this.props.setResult("loading");
            } else {
                this.props.setResult(this.props.result);
            }
            console.log("result from rust:" + this.props.result);
        }
    }

    public receiveFileOnDrop(acceptedFiles: Array<File>): void {
        //console.log(dropEvent);
        if (acceptedFiles && acceptedFiles.length != 0 && acceptedFiles[0] != null) {
            const file = acceptedFiles[0];
            this.props.setFileName(file.name);
            this.props.setResultLoading(true);
            this.props.setResult(undefined);
            this.props.setFile(file);
            this.chunksState.setRemainingFileSize(file.size);
            this.chunksState.setChunkNumber(0);
            console.log(this.passNextToCore());
            console.log(this.passNextToCore());

            //this.passToMichael(acceptedFiles);
        }
        //console.log(acceptedFiles);
    }

    defineDropzoneStyle(isDragActive: boolean, acceptedFiles: File[], fileRejections: FileRejection[]): string {
        //const dropzoneStyle = () => {

        //const styleString = "dropzoneBase";

        let styleString = "dropzoneBase";
        if (isDragActive) { styleString = "dropzoneActive" };
        if (acceptedFiles.length !== 0) { styleString = "dropzoneAccept" };
        if (fileRejections.length !== 0) { styleString = "dropzoneReject" };

        return styleString;

    }

    listAcceptedFiles(acceptedFiles: File[]) {
        return acceptedFiles.map(file => (
            <li key={file.name}>
                {file.name} - {file.size} bytes
            </li>
        ));
    }


    public render() {
        return <div>
            <div className={"dropzone-container"}>
                <p>
                    Selected file: {this.props.fileName ? this.props.fileName : "select a file"}
                </p>
                <Dropzone
                    accept={['.parquet', '.csv']}
                    multiple={false}
                    onDrop={(acceptedFiles) => this.receiveFileOnDrop(acceptedFiles)}>
                    {({ getRootProps, getInputProps, isDragActive, isDragAccept, isDragReject, acceptedFiles, fileRejections }: DropzoneState): any => {

                        const dropzoneStyle: string = this.defineDropzoneStyle(isDragActive, acceptedFiles, fileRejections);

                        return (
                            <section className={styles[dropzoneStyle]}>
                                <div {...getRootProps()} style={{ width: "100%", height: "100%" }}>
                                    <input {...getInputProps()} />
                                    <p> Drag files here, or click to select files.
                                        <br></br>
                                        Only parquet files are allowed.
                                    </p>
                                    {acceptedFiles.length != 0 ?
                                        <p>Selected file (valid): {this.listAcceptedFiles(acceptedFiles)}</p> :
                                        (fileRejections.length != 0 ? <p>File not valid!</p> : <p>No files selected.</p>)}
                                </div>
                            </section>)
                    }}
                </Dropzone>
            </div>

            <div className={"resultArea"} {...this.awaitResultFromCore()} >
                <p>
                    {this.props.resultLoading ?
                        <CircularProgress />
                        :
                        this.props.result}
                </p>
            </div>
        </div>;
    }

}

const mapStateToProps = (state: model.AppState) => ({
    fileName: state.fileName,
    resultLoading: state.resultLoading,
    result: state.result,
    chunksNumber: state.chunksNumber,
    file: state.file,
});

const mapDispatchToProps = (dispatch: model.Dispatch) => ({
    setFileName: (newFileName: string) =>
        dispatch({
            type: model.StateMutationType.SET_FILENAME,
            data: newFileName,
        }),
    setResultLoading: (newResultLoading: boolean) =>
        dispatch({
            type: model.StateMutationType.SET_RESULTLOADING,
            data: newResultLoading,
        }),
    setResult: (newResult: string | undefined) =>
        dispatch({
            type: model.StateMutationType.SET_RESULT,
            data: newResult,
        }),
    setChunksNumber: (newChunksNumber: number) =>
        dispatch({
            type: model.StateMutationType.SET_CHUNKSNUMBER,
            data: newChunksNumber,
        }),
    setFile: (newFile: File) =>
        dispatch({
            type: model.StateMutationType.SET_FILE,
            data: newFile,
        }),
});

export default connect(mapStateToProps, mapDispatchToProps)(Parquet);

//get notification from rust
export function update() {
    console.log("notification from rust");
    const result = "" + profiler_core.getState();

    store.dispatch({
        type: model.StateMutationType.SET_RESULTLOADING,
        data: false,
    });
    store.dispatch({
        type: model.StateMutationType.SET_RESULT,
        data: result,
    });

}