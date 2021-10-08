import * as model from '../model';
import React from 'react';
import { connect } from 'react-redux';
import Dropzone, { DropzoneState, FileRejection } from 'react-dropzone'
import styles from '../style/upload.module.css';
import { IAppContext, withAppContext } from '../app_context';
import { LinearProgress } from '@material-ui/core';
import { Redirect } from 'react-router-dom';

interface Props {
    appContext: IAppContext;
    file: undefined | File;
    fileName: string | undefined;
    csvParsingFinished: boolean;
    fileLoading: boolean;
    setFile: (newFile: File) => void;
    setCsvParsingFinished: (newCsvParsingFinished: boolean) => void;
    setFileLoading: (newFileLoading: boolean) => void;
    setResetState: () => void;
}

interface State {
    allowRedirect: boolean;
}

class FileUploader extends React.Component<Props, State> {

    constructor(props: Props) {
        super(props);
        this.state = {
            allowRedirect: false,
        };

        this.receiveFileOnDrop = this.receiveFileOnDrop.bind(this);
        this.defineDropzoneStyle = this.defineDropzoneStyle.bind(this);
    }

    public receiveFileOnDrop(acceptedFiles: Array<File>): void {
        if (acceptedFiles && acceptedFiles.length != 0 && acceptedFiles[0] != null) {
            const file = acceptedFiles[0];
            this.props.setFileLoading(true);
            this.props.setCsvParsingFinished(false);
            this.props.setFile(file);
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
            <li className={styles.acceptedFilesList} key={file.name}>
                {file.name} - {file.size} bytes
            </li>
        ));
    }

    componentDidMount(): void {
        this.props.setResetState();
    }

    componentDidUpdate(prevProps: Props): void {
        if (prevProps.csvParsingFinished != this.props.csvParsingFinished) {
            if (this.props.csvParsingFinished) {
                this.setState({
                    ...this.state,
                    allowRedirect: true,
                });
            }
        }
    }

    public render() {
        return <div className={styles.dropzoneContainer}>
            {this.state.allowRedirect && <Redirect to={"/dummy"} />}
{/*             {this.state.allowRedirect && <Redirect to={"/dashboard"} />}
 */}

            {(!this.props.csvParsingFinished && undefined !== this.props.file) && <div className={styles.fileUploaderLinearProgressContainer}>
                <LinearProgress color="secondary" />
            </div>}
            
            <Dropzone
                accept={['.parquet', '.csv']}
                multiple={false}
                onDrop={(acceptedFiles) => this.receiveFileOnDrop(acceptedFiles)}>
                {({ getRootProps, getInputProps, isDragActive, isDragAccept, isDragReject, acceptedFiles, fileRejections }: DropzoneState): any => {

                    const dropzoneStyle: string = this.defineDropzoneStyle(isDragActive, acceptedFiles, fileRejections);

                    return (
                        <section className={styles[dropzoneStyle]}>
                            <div className={styles.dropzoneInner} {...getRootProps()} style={{ width: "100%", height: "100%" }}>
                                <input {...getInputProps()} />
                                <div className={styles.dropzoneInnerText}>
                                    <p> Drag files here, or click to select files.
                                        <br></br>
                                        Only csv files are allowed.
                                    </p>
                                    {acceptedFiles.length != 0 ?
                                        <p>Selected file (valid): {this.listAcceptedFiles(acceptedFiles)}</p> :
                                        (fileRejections.length != 0 ? <p>File not valid!</p> : <p>No files selected.</p>)}
                                </div>
                            </div>
                        </section>)
                }}
            </Dropzone>
        </div >;
    }

}

const mapStateToProps = (state: model.AppState) => ({
    file: state.file,
    fileName: state.fileName,
    csvParsingFinished: state.csvParsingFinished,
    fileLoading: state.fileLoading,
});

const mapDispatchToProps = (dispatch: model.Dispatch) => ({
    setFile: (newFile: File) => dispatch({
        type: model.StateMutationType.SET_FILE,
        data: newFile,
    }),
    setCsvParsingFinished: (newCsvParsingFinished: boolean) => dispatch({
        type: model.StateMutationType.SET_CSVPARSINGFINISHED,
        data: newCsvParsingFinished,
    }),
    setFileLoading: (newFileLoading: boolean) =>
        dispatch({
            type: model.StateMutationType.SET_FILELOADING,
            data: newFileLoading,
        }),
    setResetState: () =>
        dispatch({
            type: model.StateMutationType.RESET_STATE,
            data: undefined,
        }),
});

export default connect(mapStateToProps, mapDispatchToProps)(withAppContext(FileUploader));
