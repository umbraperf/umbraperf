import * as model from '../../model';
import React from 'react';
import { connect } from 'react-redux';
import Dropzone, { DropzoneState, FileRejection } from 'react-dropzone'
import * as d3 from 'd3';
import styles from '../style/upload.module.css';
import { CircularProgress } from '@material-ui/core';
import { Result } from 'src/model/core_result';
import { IAppContext, withAppContext } from '../../app_context';
import { WebFileController } from '../../controller/web_file_controller';

interface Props {
    appContext: IAppContext;
    file: undefined | File;
    fileName: string | undefined;
    resultLoading: boolean;
    result: Result | undefined;
}

class BarChart extends React.Component<Props> {

    barChartRef: React.RefObject<HTMLDivElement>;

    constructor(props: Props) {
        super(props);

        this.barChartRef = React.createRef<HTMLDivElement>();

    }

    createVisualization() {

        const test: Result = {
            request: 100,
            x: ["test3", "test4", "test5"],
            y: [5, 4, 3],
            test: 1,
        };

    
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
            .domain([0, d3.max(test.x!) as number]).nice()
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
            .attr("y", (d, i) => y(test.x![i]))
            .attr("width", x.bandwidth())
            .attr("height", function (d, i) { return y(0) - y(test.y![i]); })
            .attr("fill", "#69b3a2")

    }

    componentDidUpdate(prevProps: Props): void {
        if (prevProps.result != this.props.result && undefined != this.props.result && !this.props.resultLoading) {
            //TODO
        }
    }

    componentDidMount(): void {
        this.createVisualization();
    }

    public render() {
        return <div>

            <div className={"resultArea"} >
                {(this.props.resultLoading || this.props.result) ?
                    (this.props.resultLoading ?
                        <CircularProgress />
                        :
                        <div>
                            <p>Result of computation from rust is: {this.props.result?.test}</p>
                            <div id="bar-chart-ref" ref={this.barChartRef}></div>
                        </div>
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
    resultLoading: state.resultLoading,
    result: state.result,
});


export default connect(mapStateToProps)(withAppContext(BarChart));
