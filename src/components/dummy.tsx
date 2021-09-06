import * as model from '../model';
import store from '../app';
import React from 'react';
import { connect } from 'react-redux';
import Dropzone, { DropzoneState, FileRejection } from 'react-dropzone'

import styles from '../style/upload.module.css';
import { CircularProgress } from '@material-ui/core';
import { Result } from 'src/model/core_result';

interface Props {
    fileName: string | undefined;
    setFileName: (newFileName: string) => void;
    resultLoading: boolean;
    setResultLoading: (newResultLoading: boolean) => void;
    result: Result | undefined;
    setResult: (newResult: Result | undefined) => void;
    chunksNumber: number;
    setChunksNumber: (newChunksNumber: number) => void;
}


class Dummy extends React.Component<Props> {

    constructor(props: Props) {
        super(props);

        this.receiveFileOnDrop = this.receiveFileOnDrop.bind(this);
        this.awaitResultFromCore = this.awaitResultFromCore.bind(this);
        this.defineDropzoneStyle = this.defineDropzoneStyle.bind(this);
    }

    public async passToMichael(files: Array<File>) {
        // const files = event.target.files;
        if (!files || files?.length == 0 || files![0] == null) return;
        const file = files[0];
        const fileSize = file.size;
        const chunkSize = 4000;
        let remaining = fileSize;
        let offset = 0;
        const numberOfChunks = Math.ceil(fileSize / chunkSize);
        this.props.setChunksNumber(numberOfChunks);
        // profiler_core.setExpectedChunks(numberOfChunks);

        while (remaining > 0) {
            const readHere = Math.min(remaining, chunkSize);
            let chunk = file.slice(offset, offset + readHere);
            const data = await chunk.arrayBuffer();
/*             profiler_core.consumeChunk(new Uint8Array(data));
 */            remaining -= readHere;
            offset += readHere;
        }
    }

    public async awaitResultFromCore() {
        if (this.props.fileName) {
            if (this.props.resultLoading) {
                this.props.setResult(undefined);
            } else {
                this.props.setResult(this.props.result);
            }
        }
    }

    public receiveFileOnDrop(acceptedFiles: Array<File>): void {
        //console.log(dropEvent);
        if (acceptedFiles && acceptedFiles.length != 0 && acceptedFiles[0] != null) {
            this.props.setFileName(acceptedFiles[0].name);
            this.props.setResultLoading(true);
            this.props.setResult(undefined);
            this.passToMichael(acceptedFiles);
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
            {/*             {this.props.helloworld}<br />
            <button onClick={() => this.props.setHelloWorld("bar")} >SetBar</button>
            <button onClick={() => profiler_core.printSomething("bam")} >CallIntoWasm</button>
            <input type="file" onChange={(args: any) => this.passToMichael(args)} /> */}

            <div className={"dropzone-container"}>
                <p>
                    Selected file: {this.props.fileName ? this.props.fileName : "select a file"}
                </p>
                <Dropzone
                    accept={'.csv'}
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
                                        Only .csv files are allowed.
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
                        "See visualization."}
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
    setResult: (newResult: Result | undefined) =>
        dispatch({
            type: model.StateMutationType.SET_RESULT,
            data: newResult,
        }),
    setChunksNumber: (newChunksNumber: number) =>
        dispatch({
            type: model.StateMutationType.SET_CHUNKSNUMBER,
            data: newChunksNumber,
        }),
});

export default connect(mapStateToProps, mapDispatchToProps)(Dummy);

//get notification from rust
export function update() {
    const result = undefined;
    // const result = "" + profiler_core.getState();

    store.dispatch({
        type: model.StateMutationType.SET_RESULTLOADING,
        data: false,
    });
    store.dispatch({
        type: model.StateMutationType.SET_RESULT,
        data: result,
    });

}