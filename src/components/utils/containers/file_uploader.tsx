import * as model from '../../../model';
import * as Controller from '../../../controller';
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
    umbraperfFileParsingFinished: boolean;
    fileLoading: boolean;
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
            Controller.handleNewFile(file);
        }
    }

    defineDropzoneStyle(isDragActive: boolean, acceptedFiles: File[], fileRejections: FileRejection[]): string {
        let styleString = "dropzoneBase";
        if (isDragActive) { styleString = "dropzoneActive" };
        if (acceptedFiles.length !== 0 || this.props.fileLoading) { styleString = "dropzoneAccept" };
        if (fileRejections.length !== 0) { styleString = "dropzoneReject" };

        return styleString;
    }

    listAcceptedFile() {
        const file = this.props.file!;
        return <span className={styles.acceptedFilesList}>
            <br/>
            {file.name} - {Math.round((file.size / 1000000 + Number.EPSILON) * 100) / 100} MB
        </span>
    }

    componentDidMount(): void {
        Controller.resetState();
        Controller.setCurrentView(model.ViewType.UPLOAD);
    }

    componentDidUpdate(prevProps: Props): void {
        if (prevProps.umbraperfFileParsingFinished != this.props.umbraperfFileParsingFinished) {
            if (this.props.umbraperfFileParsingFinished) {
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
            if (!this.props.umbraperfFileParsingFinished && !this.props.fileLoading) {
                innerText = <p> Drag your umbraPerf file here!
                    <br></br>
                    (or click to select files)
                </p>
            } else if (!this.props.umbraperfFileParsingFinished && this.props.fileLoading) {
                innerText = <Spinner />
            }

            return innerText;
        }

        const lowerLine = () => {
            let innerText;
            if (fileRejections.length != 0) {
                innerText = <p>File not valid!</p>;
                return innerText;
            } else if (this.props.file) {
                innerText = <p>Loading File: {this.listAcceptedFile()}</p>;
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
            {this.state.allowRedirect && <Redirect to={this.props.appContext.topLevelComponents[1].path} />}

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
    umbraperfFileParsingFinished: state.umbraperfFileParsingFinished,
    fileLoading: state.fileLoading,
});


export default connect(mapStateToProps)(withAppContext(FileUploader));
