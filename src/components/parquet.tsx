import * as model from '../model';
import store from '../app';
import React from 'react';
import { connect } from 'react-redux';
import Dropzone, { DropzoneState, FileRejection } from 'react-dropzone'
import * as d3 from 'd3';
import styles from '../style/dummy.module.css';
import { CircularProgress } from '@material-ui/core';
import { Result } from 'src/model/core_result';
import { IAppContext, withAppContext } from '../app_context';
import {WebFileController} from '../controller/web_file_controller';

interface Props {
    appContext: IAppContext;
    file: undefined | File;
    fileName: string | undefined;
    resultLoading: boolean;
    result: Result | undefined;
    chunksNumber: number;
    setResultLoading: (newResultLoading: boolean) => void;
    setChunksNumber: (newChunksNumber: number) => void;
}

class Parquet extends React.Component<Props> {

    barChartRef: React.RefObject<HTMLDivElement>;

    constructor(props: Props) {
        super(props);

        this.barChartRef = React.createRef<HTMLDivElement>();

        this.receiveFileOnDrop = this.receiveFileOnDrop.bind(this);
        this.defineDropzoneStyle = this.defineDropzoneStyle.bind(this);
    }

    public receiveFileOnDrop(acceptedFiles: Array<File>): void {
        //console.log(dropEvent);
        if (acceptedFiles && acceptedFiles.length != 0 && acceptedFiles[0] != null) {
            this.props.setResultLoading(true);
            const file = acceptedFiles[0];
            const webFileControllerInstance = new WebFileController(this.props.appContext.worker);
            webFileControllerInstance.regiterFileAtWorker(file);
            
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

    createVisualization() {

        const data = [{ id: "test1", value: 1 },
        { id: "test2", value: 2 },
        { id: "test3", value: 3 },
        { id: "test4", value: 4 },
        { id: "test5", value: 5 }];

        const test: Result = {
            request: "parquet",
            x: ["test3", "test4", "test5"],
            y: [5, 4, 3],
        };

        const testFromRust: Result = this.props.result!;
        console.log(testFromRust);

        // set the dimensions and margins of the graph
        const margin = { top: 30, right: 30, bottom: 70, left: 60 },
            width = 460 - margin.left - margin.right,
            height = 400 - margin.top - margin.bottom;

        // append the svg object to the body of the page
        let svg = d3.select(this.barChartRef.current)
            .append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform",
                "translate(" + margin.left + "," + margin.top + ")");

        // Add X axis
        const x = d3.scaleBand()
            .range([0, width])
            .domain(test.x!.map(function (d) { return d; }))
            .padding(0.2);
        svg.append("g")
            .attr("transform", "translate(0," + height + ")")
            .call(d3.axisBottom(x))
            .selectAll("text")
            .attr("transform", "translate(-10,0)rotate(-45)")
            .style("text-anchor", "end");

        // Add Y axis
        const y = d3.scaleLinear()
            .domain([0, d3.max(testFromRust.x!) as number]).nice()
            .range([height, 0]);
        svg.append("g")
            .call(d3.axisLeft(y));

        // Bars
        svg.selectAll("bar")
            .data(test.x as Array<string>)
            .enter()
            .append("rect")
            //.attr("x", (d) => x(d.id) || 0)
            .attr("x", (d) => x(d) || 0)
            //.attr("y", (d) => y(d.value))
            .attr("y", (d, i) => y(testFromRust.x![i]))
            .attr("width", x.bandwidth())
            .attr("height", function (d, i) { return y(0) - y(testFromRust.x![i]); })
            .attr("fill", "#69b3a2")

    }

    componentDidUpdate(prevProps: Props): void {
        ;
        if (prevProps.result != this.props.result && undefined != this.props.result && !this.props.resultLoading) {
            if (this.props.result.request === "parquet") {
                this.createVisualization();
            }
        }
    }

    public render() {
        return <div>
            {/*             <form  >
                <label>Wählen Sie eine Textdatei (*.txt, *.html usw.) von Ihrem Rechner aus.
                    <input type="file" />
                </label>
                <button>… und ab geht die Post!</button>
            </form> */}
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
                {this.props.resultLoading ?
                    <CircularProgress />
                    :
                    <div id="bar-chart-ref" ref={this.barChartRef}></div>
                }
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

export default connect(mapStateToProps, mapDispatchToProps)(withAppContext(Parquet));
//export default connect(mapStateToProps, mapDispatchToProps)(Parquet);




