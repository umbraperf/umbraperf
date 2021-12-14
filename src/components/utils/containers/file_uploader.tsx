import * as model from '../../../model';
import React from 'react';
import { connect } from 'react-redux';
import Dropzone, { DropzoneState, FileRejection } from 'react-dropzone'
import styles from '../../../style/upload.module.css';
import Spinner from '../spinner/spinner';
import { IAppContext, withAppContext } from '../../../app_context';
import { Redirect } from 'react-router-dom';

interface Props {
    appContext: IAppContext;
    file: undefined | File;
    csvParsingFinished: boolean;
    fileLoading: boolean;
    setFile: (newFile: File) => void;
    setCsvParsingFinished: (newCsvParsingFinished: boolean) => void;
    setFileLoading: (newFileLoading: boolean) => void;
    setCurrentView: (newCurrentView: model.ViewType) => void;
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
                {file.name} - {Math.round((file.size / 1000000 + Number.EPSILON) * 100) / 100} MB
            </li>
        ));
    }

    componentDidMount(): void {
        this.props.setResetState();
        this.props.setCurrentView(model.ViewType.UPLOAD);
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

    createDropzoneInnerContent(acceptedFiles: any, fileRejections: any) {

        const upperLine = () => {
            let innerText;
            if (!this.props.csvParsingFinished && !this.props.fileLoading) {
                innerText = <p> Drag your umbraPerf file here!
                    <br></br>
                    (or click to select files)
                </p>
            } else if (!this.props.csvParsingFinished && this.props.fileLoading && acceptedFiles.length != 0) {
                innerText = <Spinner />
            }

            return innerText;
        }

        const lowerLine = () => {
            let innerText;
            if (fileRejections.length != 0) {
                innerText = <p>File not valid!</p>;
                return innerText;
            } else if (acceptedFiles.length != 0) {
                innerText = <p>Loading File: {this.listAcceptedFiles(acceptedFiles)}</p>;
                return innerText;
            } else {
                innerText = <p>No files selected.</p>;
                return innerText;
            }
        }


        const innerDiv =
            <div className={styles.dropzoneInnerText}>
                {upperLine()}
                {lowerLine()}
            </div>

        return innerDiv;

    }

    public render() {
        return <div className={styles.dropzoneContainer}>
            {this.state.allowRedirect && <Redirect to={"/dashboard-single-event"} />}

            <Dropzone
                accept={['.umbraperf']}
                multiple={false}
                onDrop={(acceptedFiles) => this.receiveFileOnDrop(acceptedFiles)}>
                {({ getRootProps, getInputProps, isDragActive, isDragAccept, isDragReject, acceptedFiles, fileRejections }: DropzoneState): any => {

                    const dropzoneStyle: string = this.defineDropzoneStyle(isDragActive, acceptedFiles, fileRejections);

                    return (
                        <section className={styles[dropzoneStyle]}>
                            <div className={styles.dropzoneInner} {...getRootProps()} style={{ width: "100%", height: "100%" }}>
                                <input {...getInputProps()} />
                                {this.createDropzoneInnerContent(acceptedFiles, fileRejections)}
                            </div>
                        </section>)
                }}
            </Dropzone>
        </div >;
    }

}

const mapStateToProps = (state: model.AppState) => ({
    file: state.file,
    csvParsingFinished: state.csvParsingFinished,
    fileLoading: state.fileLoading,
});

const mapDispatchToProps = (dispatch: model.Dispatch) => ({
    setFile: (newFile: File) => dispatch({
        type: model.StateMutationType.SET_FILE,
        data: newFile,
    }),
    setCsvParsingFinished: (newCsvParsingFinished: boolean) => dispatch({
        type: model.StateMutationType.SET_CSV_PARSING_FINISHED,
        data: newCsvParsingFinished,
    }),
    setFileLoading: (newFileLoading: boolean) =>
        dispatch({
            type: model.StateMutationType.SET_FILE_LOADING,
            data: newFileLoading,
        }),
    setCurrentView: (newCurrentView: model.ViewType) =>
        dispatch({
            type: model.StateMutationType.SET_CURRENT_VIEW,
            data: newCurrentView,
        }),
    setResetState: () =>
        dispatch({
            type: model.StateMutationType.SET_RESET_STATE,
            data: undefined,
        }),
});

export default connect(mapStateToProps, mapDispatchToProps)(withAppContext(FileUploader));
