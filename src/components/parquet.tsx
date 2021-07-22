import * as model from '../model';
import store from '../app';
import React from 'react';
import { connect } from 'react-redux';
import Dropzone, { DropzoneState, FileRejection } from 'react-dropzone'

import styles from '../style/dummy.module.css';
import { CircularProgress } from '@material-ui/core';
import { WebFile } from '../model';

interface Props {
    file: undefined | File;
    fileName: string | undefined;
    resultLoading: boolean;
    result: string | undefined;
    chunksNumber: number;
    setResultLoading: (newResultLoading: boolean) => void;
    setChunksNumber: (newChunksNumber: number) => void;
}

class Parquet extends React.Component<Props> {

    constructor(props: Props) {
        super(props);

        this.receiveFileOnDrop = this.receiveFileOnDrop.bind(this);
        this.defineDropzoneStyle = this.defineDropzoneStyle.bind(this);
    }


/*     public async awaitResultFromCore() {
        if (this.props.fileName) {
            console.log(this.props.resultLoading);
            if (this.props.resultLoading) {
                this.props.setResult("loading");
            } else {
                this.props.setResult(this.props.result);
            }
            console.log("result from rust:" + this.props.result);
        }
    } */

    public receiveFileOnDrop(acceptedFiles: Array<File>): void {
        //console.log(dropEvent);
        if (acceptedFiles && acceptedFiles.length != 0 && acceptedFiles[0] != null) {
            this.props.setResultLoading(true);
            const file = acceptedFiles[0];
            const webfile = new WebFile();
            webfile.setNewFile(file.name,file);
        }
    }

    defineDropzoneStyle(isDragActive: boolean, acceptedFiles: File[], fileRejections: FileRejection[]): string {
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

            <div className={"resultArea"} >
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
    file: state.file,
    fileName: state.fileName,
    resultLoading: state.resultLoading,
    result: state.result,
    chunksNumber: state.chunksNumber,
});

const mapDispatchToProps = (dispatch: model.Dispatch) => ({
    setResultLoading: (newResultLoading: boolean) =>
        dispatch({
            type: model.StateMutationType.SET_RESULTLOADING,
            data: newResultLoading,
        }),
    setChunksNumber: (newChunksNumber: number) =>
        dispatch({
            type: model.StateMutationType.SET_CHUNKSNUMBER,
            data: newChunksNumber,
        }),
});

export default connect(mapStateToProps, mapDispatchToProps)(Parquet);

//get notification from rust
export function update() {
    console.log("notification from rust");
    const result = ""

    store.dispatch({
        type: model.StateMutationType.SET_RESULTLOADING,
        data: false,
    });
    store.dispatch({
        type: model.StateMutationType.SET_RESULT,
        data: result,
    });

}