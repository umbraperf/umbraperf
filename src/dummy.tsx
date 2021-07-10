import * as model from './model';
import React from 'react';
import { connect } from 'react-redux';
import Dropzone, { DropzoneState } from 'react-dropzone'

import * as profiler_core from '../crate/pkg';

import styles from './dummy.module.css';

interface Props {
    helloworld: string;
    setHelloWorld: (newGreeter: string) => void;
    fileName: string | undefined;
    setFileName: (newFileName: string) => void;
    result: string;
    setResult: (newResult: string) => void;
    chunksNumber: number;
    setChunksNumber: (newChunksNumber: number) => void;
}

class Dummy extends React.Component<Props> {

    constructor(props: Props) {
        super(props);
        this.receiveFileOnDrop = this.receiveFileOnDrop.bind(this);
        this.getResultFromMichael = this.getResultFromMichael.bind(this);
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
        const numberOfChunks = Math.ceil(fileSize/chunkSize);
        this.props.setChunksNumber(numberOfChunks);
        //profiler_core.setExpectedChunks(numberOfChunks);

        while (remaining > 0) {
            const readHere = Math.min(remaining, chunkSize);
            let chunk = file.slice(offset, offset + readHere);
            const data = await chunk.arrayBuffer();
            console.log(data)
            profiler_core.consumeChunk(new Uint8Array(data));
            remaining -= readHere;
            offset += readHere;
        }
        console.log(numberOfChunks);
    }

    public async getResultFromMichael() {
        if(this.props.fileName){
            this.props.setResult("loading...");

            console.log(this.props.chunksNumber);

/*             while(profiler_core.getProcessedChunks() !== this.props.chunksNumber){
                console.log("working");
            } */
            console.log("fertig");

            //const result: any = await profiler_core.getState();
            //console.log("statte: " + result);
            //this.props.setResult(result);
        }
    }

    public receiveFileOnDrop(acceptedFiles: Array<File>): void {

        if (acceptedFiles && acceptedFiles.length != 0 && acceptedFiles[0] != null) {
            this.props.setFileName(acceptedFiles[0].name);
            this.passToMichael(acceptedFiles);
        }
        console.log(acceptedFiles);

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

                        const dropzoneStyle = () => {
                            if (isDragActive) {
                                return "dropzoneActive";
                            } else if (acceptedFiles.length !== 0) {
                                return "dropzoneAccept";
                            } else if (fileRejections.length !== 0) {
                                return "dropzoneReject"
                            } else {
                                return "dropzoneBase"
                            }
                        };

                        return (
                            <section className={styles[dropzoneStyle()]}>
                                <div {...getRootProps()} style={{ width: "100%", height: "100%" }}>
                                    <input {...getInputProps()} />
                                    <p> Drag files here, or click to select files.
                                        <br></br>
                                        Only .csv files are allowed.
                                    </p>
                                </div>
                            </section>)
                    }}
                </Dropzone>
            </div>
            
            <div className={"resultArea"} {...this.getResultFromMichael()} >
                <p>
                    {this.props.result}
                </p>
            </div>
        </div>;
    }

}

/* class Dummy extends React.Component<Props> {
    public async passToMichael(event: React.ChangeEvent<HTMLInputElement>) {
        const files = event.target.files;
        if (!files || files?.length == 0 || files![0] == null) return;
        const file = files[0];
        const fileSize = file.size;
        let remaining = fileSize;
        let offset = 0;
        while (remaining > 0) {
            const readHere = Math.min(remaining, 4000);
            let chunk = file.slice(offset, offset + readHere);
            const data = await chunk.arrayBuffer();
            console.log(data)
            profiler_core.consumeChunk(new Uint8Array(data));
            remaining -= readHere;
            offset += readHere;
        }
    }

    public render() {
        return <div>
            {this.props.helloworld}<br />
            <button onClick={() => this.props.setHelloWorld("bar")} >SetBar</button>
            <button onClick={() => profiler_core.printSomething("bam")} >CallIntoWasm</button>
            <input type="file" onChange={(args: any) => this.passToMichael(args)} />
        </div>;
    }

} */

const mapStateToProps = (state: model.AppState) => ({
    helloworld: state.helloworld,
    fileName: state.fileName,
    result: state.result,
    chunksNumber: state.chunksNumber,
});

const mapDispatchToProps = (dispatch: model.Dispatch) => ({
    setHelloWorld: (newGreeter: string) =>
        dispatch({
            type: model.StateMutationType.SET_GREETER,
            data: newGreeter,
        }),
    setFileName: (newFileName: string) =>
        dispatch({
            type: model.StateMutationType.SET_FILENAME,
            data: newFileName,
        }),
    setResult: (newResult: string) =>
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

export function update(){
    console.log("hi");
}