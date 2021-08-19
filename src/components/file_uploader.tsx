import * as model from '../model';
import React from 'react';
import { connect } from 'react-redux';
import Dropzone, { DropzoneState, FileRejection } from 'react-dropzone'
import styles from '../style/upload.module.css';
import { Result } from 'src/model/core_result';
import { IAppContext, withAppContext } from '../app_context';
import { WebFileController } from '../controller/web_file_controller';

interface Props {
    appContext: IAppContext;
    file: undefined | File;
    fileName: string | undefined;
    resultLoading: boolean;
    result: Result | undefined;
    setResultLoading: (newResultLoading: boolean) => void;
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
            this.props.setResultLoading(true);
            const file = acceptedFiles[0];
            const webFileControllerInstance = new WebFileController(this.props.appContext.worker);
            webFileControllerInstance.registerFileAtWorker(file);

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
        model.createDefaultState();
    }

    componentDidUpdate(prevProps: Props): void {
        if (prevProps.result != this.props.result && undefined != this.props.result && !this.props.resultLoading) {
            //TODO: activate tabs
            //TODO: spinner in dropzone?
        }
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

        </div>;
    }

}

const mapStateToProps = (state: model.AppState) => ({
    file: state.file,
    fileName: state.fileName,
    resultLoading: state.resultLoading,
    result: state.result,
});

const mapDispatchToProps = (dispatch: model.Dispatch) => ({
    setResultLoading: (newResultLoading: boolean) =>
        dispatch({
            type: model.StateMutationType.SET_RESULTLOADING,
            data: newResultLoading,
        }),
});

export default connect(mapStateToProps, mapDispatchToProps)(withAppContext(FileUploader));
