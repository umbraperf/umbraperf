import * as model from '../model';
import React from 'react';
import { connect } from 'react-redux';
import Dropzone, { DropzoneState, FileRejection } from 'react-dropzone'
import styles from '../style/upload.module.css';
import { Result } from 'src/model/core_result';
import { IAppContext, withAppContext } from '../app_context';
import { CircularProgress } from '@material-ui/core';

interface Props {
    appContext: IAppContext;
    file: undefined | File;
    fileName: string | undefined;
    eventsLoading: boolean;
    events: Array<string> | undefined;
    resultLoading: boolean;
    result: Result | undefined;
    setEventsLoading: (newEventsLoading: boolean) => void;
    setResultLoading: (newResultLoading: boolean) => void;
    setResetState: () => void;
}

class FileUploader extends React.Component<Props> {

    constructor(props: Props) {
        super(props);

        this.receiveFileOnDrop = this.receiveFileOnDrop.bind(this);
        this.defineDropzoneStyle = this.defineDropzoneStyle.bind(this);
    }

    public receiveFileOnDrop(acceptedFiles: Array<File>): void {
        //console.log(dropEvent);
        if (acceptedFiles && acceptedFiles.length != 0 && acceptedFiles[0] != null) {
            this.props.setResetState();
            this.props.setEventsLoading(true);
            this.props.setResultLoading(true);
            const file = acceptedFiles[0];
            this.props.appContext.controller.registerFileAtWorker(file);
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

    componentDidMount(): void {
        console.log(this.props);
    }

    componentDidUpdate(prevProps: Props): void {
        if (prevProps.result != this.props.result && undefined != this.props.result && !this.props.resultLoading) {
        }
    }

    public render() {
        return <div>
            <div className={"dropzone-container"}>

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
                                        Only csv files are allowed.
                                    </p>
                                    {acceptedFiles.length != 0 ?
                                        <p>Selected file (valid): {this.listAcceptedFiles(acceptedFiles)}</p> :
                                        (fileRejections.length != 0 ? <p>File not valid!</p> : <p>No files selected.</p>)}
                                </div>
                            </section>)
                    }}
                </Dropzone>
            </div>
            <div className={styles.spinnerArea} >
                {(this.props.eventsLoading || this.props.events) ?
                    (this.props.eventsLoading ?
                        <CircularProgress />
                        :
                        <p>Loading of file finished. Select a visualization to start rendering: </p>
                    )
                    :
                    <p>Select a file.</p>
                }
            </div>

        </div>;
    }

}

const mapStateToProps = (state: model.AppState) => ({
    file: state.file,
    fileName: state.fileName,
    eventsLoading: state.eventsLoading,
    events: state.events,
    resultLoading: state.resultLoading,
    result: state.result,
});

const mapDispatchToProps = (dispatch: model.Dispatch) => ({
    setEventsLoading: (newEventsLoading: boolean) => dispatch({
        type: model.StateMutationType.SET_EVENTSLOADING,
        data: newEventsLoading,
    }),
    setResultLoading: (newResultLoading: boolean) =>
        dispatch({
            type: model.StateMutationType.SET_RESULTLOADING,
            data: newResultLoading,
        }),
    setResetState: () =>
        dispatch({
            type: model.StateMutationType.RESET_STATE,
            data: undefined,
        }),
});

export default connect(mapStateToProps, mapDispatchToProps)(withAppContext(FileUploader));
