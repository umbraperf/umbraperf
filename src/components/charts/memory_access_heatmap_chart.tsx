import * as model from '../../model';
import * as Controller from '../../controller/request_controller';
import * as Context from '../../app_context';
import Spinner from '../utils/spinner';
import React from 'react';
import { connect } from 'react-redux';
import { SignalListeners, Vega } from 'react-vega';
import { VisualizationSpec } from "react-vega/src";
import { Redirect } from 'react-router-dom';
import { createRef } from 'react';
import _ from "lodash";


interface Props {
    appContext: Context.IAppContext;
    resultLoading: model.ResultLoading;
    result: model.Result | undefined;
    csvParsingFinished: boolean;
    currentChart: string;
    currentEvent: string;
    events: Array<string> | undefined;
    chartIdCounter: number;
    chartData: model.ChartDataKeyValue,
    currentPipeline: Array<string> | "All";
    currentOperator: Array<string> | "All";
    operators: Array<string> | undefined;
    currentTimeBucketSelectionTuple: [number, number],
    setCurrentChart: (newCurrentChart: string) => void;
    setChartIdCounter: (newChartIdCounter: number) => void;
}

interface State {
    chartId: number,
    width: number,
    height: number,
}

class MemoryAccessHeatmapChart extends React.Component<Props, State> {

    elementWrapper = createRef<HTMLDivElement>();

    constructor(props: Props) {
        super(props);
        this.state = {
            chartId: this.props.chartIdCounter,
            width: 0,
            height: 0,
        };
        this.props.setChartIdCounter((this.state.chartId) + 1);

        this.createVisualizationSpec = this.createVisualizationSpec.bind(this);
    }

    componentDidUpdate(prevProps: Props): void {

        this.requestNewChartData(this.props, prevProps);
    }

    requestNewChartData(props: Props, prevProps: Props): void {
        if (this.newChartDataNeeded(props, prevProps)) {
            Controller.requestChartData(props.appContext.controller, this.state.chartId, model.ChartType.MEMORY_ACCESS_HEATMAP_CHART);
        }
    }

    newChartDataNeeded(props: Props, prevProps: Props): boolean {
        //TODO 
        if (this.props.events &&
            this.props.operators &&
            (props.chartIdCounter !== prevProps.chartIdCounter ||
                props.currentEvent !== prevProps.currentEvent ||
                !_.isEqual(this.props.operators, prevProps.operators) ||
                !_.isEqual(this.props.currentTimeBucketSelectionTuple, prevProps.currentTimeBucketSelectionTuple))) {
            return true;
        } else {
            return false;
        }
    }

    componentDidMount() {

        this.setState((state, props) => ({
            ...state,
            width: this.elementWrapper.current!.offsetWidth,
            height: this.elementWrapper.current!.offsetHeight,
        }));

        if (this.props.csvParsingFinished) {

            this.props.setCurrentChart(model.ChartType.MEMORY_ACCESS_HEATMAP_CHART);

            addEventListener('resize', (event) => {
                this.resizeListener();
            });
        }
    }

    resizeListener() {
        if (!this.elementWrapper) return;

        const child = this.elementWrapper.current;
        if (child) {
            const newWidth = child.offsetWidth;

            child.style.display = 'none';

            this.setState((state, props) => ({
                ...state,
                width: newWidth,
            }));

            child.style.display = 'block';
        }


    }

    isComponentLoading(): boolean {
        //TODO enable
        // if (this.props.resultLoading[this.state.chartId] || !this.props.chartData[this.state.chartId] || !this.props.operators) {
        //     return true;
        // } else {
        //     return false;
        // }
        //TODO remove
        return !this.props.operators ? true : false;
    }

    public render() {

        if (!this.props.csvParsingFinished) {
            return <Redirect to={"/upload"} />
        }

        return <div ref={this.elementWrapper} style={{ display: "flex", height: "100%" }}>
            {this.isComponentLoading()
                ? <Spinner />
                : <div className={"vegaContainer"}>
                    {this.props.operators!.map((elem, index) => (<Vega className={`vegaMemoryHeatmap-${elem}`} key={index} spec={this.createVisualizationSpec(elem)} />))}
                </div>
            }
        </div>;
    }

    createVisualizationData() {

        // const operatorIdArray = ((this.props.chartData[this.state.chartId] as model.ChartDataObject).chartData.data as model.ISunburstChartData).operator;
        // const parentPipelinesArray = ((this.props.chartData[this.state.chartId] as model.ChartDataObject).chartData.data as model.ISunburstChartData).pipeline;
        // const operatorOccurrences = Array.from(((this.props.chartData[this.state.chartId] as model.ChartDataObject).chartData.data as model.ISunburstChartData).opOccurrences);
        // const pipelineOccurrences = Array.from(((this.props.chartData[this.state.chartId] as model.ChartDataObject).chartData.data as model.ISunburstChartData).pipeOccurrences);

        // //add datum for inner circle at beginning of data only on first rerender
        // operatorIdArray[0] !== "inner" && operatorIdArray.unshift("inner");
        // parentPipelinesArray[0] !== null && parentPipelinesArray.unshift(null);
        // operatorOccurrences[0] !== null && operatorOccurrences.unshift(null);
        // pipelineOccurrences[0] !== null && pipelineOccurrences.unshift(null);

        // const data = [
        //     {
        //         name: "selectedPipelines",
        //         values: { pipelinesUsed: this.props.currentPipeline === "All" ? this.props.pipelines : this.props.currentPipeline },
        //         transform: [
        //             {
        //                 type: "flatten",
        //                 fields: ["pipelinesUsed"]
        //             }
        //         ]
        //     },
        //     {
        //         name: "pipelinesShort",
        //         values: { pipeline: this.props.pipelines, pipelineShort: this.props.pipelinesShort },
        //         transform: [
        //             {
        //                 type: "flatten",
        //                 fields: ["pipeline", "pipelineShort"]
        //             }
        //         ]
        //     },
        //     {
        //         name: "selectedOperators",
        //         values: { operatorsUsed: this.props.currentOperator === "All" ? this.props.operators : this.props.currentOperator },
        //         transform: [
        //             {
        //                 type: "flatten",
        //                 fields: ["operatorsUsed"]
        //             }
        //         ]
        //     },
        //     {
        //         name: "tree",
        //         values: [
        //             { operator: operatorIdArray, parent: parentPipelinesArray, pipeOccurrences: pipelineOccurrences, opOccurrences: operatorOccurrences }
        //         ],
        //         transform: [
        //             {
        //                 type: "flatten",
        //                 fields: ["operator", "parent", "pipeOccurrences", "opOccurrences"]
        //             },
        //             {
        //                 type: "stratify",
        //                 key: "operator",
        //                 parentKey: "parent"
        //             },
        //             {
        //                 type: "partition",
        //                 field: "opOccurrences", //size of leaves -> operators
        //                 sort: { "field": "value" },
        //                 size: [{ "signal": "2 * PI" }, { "signal": "pieSize" }], //determine size of pipeline circles
        //                 as: ["a0", "r0", "a1", "r1", "depth", "children"]
        //             },
        //             {
        //                 type: "lookup", //join short pipeline names to tree table
        //                 from: "pipelinesShort",
        //                 key: "pipeline",
        //                 fields: ["operator"],
        //                 values: ["pipelineShort"],
        //             },
        //             {
        //                 type: "lookup", //join short parent pipeline names colum 
        //                 from: "pipelinesShort",
        //                 key: "pipeline",
        //                 fields: ["parent"],
        //                 values: ["pipelineShort"],
        //                 as: ["parentShort"]
        //             }
        //         ],

        //     },
        // ];

        // return data;
    }

    createVisualizationSpec(operator: string) {
        //     const visData = this.createVisualizationData();

        //     const pipelinesLegend = () => {
        //         return this.props.pipelines!.map((elem, index) => (this.props.pipelinesShort![index] + ": " + elem));
        //     }

        const spec: VisualizationSpec = {
            $schema: "https://vega.github.io/schema/vega/v5.json",
            width: 500,
            height: 400,
            padding: { left: 5, right: 5, top: 10, bottom: 10 },
            autosize: { type: "fit", resize: false },

            title: {
                text: `Memory Access Heatmap: ${operator}`,
                align: model.chartConfiguration.titleAlign,
                dy: model.chartConfiguration.titlePadding,
                fontSize: model.chartConfiguration.titleFontSize,
                font: model.chartConfiguration.titleFont,
            },

            // data: visData,
            "data": [
                {
                    "name": "temperature",
                    "url": "data/seattle-weather-hourly-normals.csv",
                    "format": { "type": "csv", "parse": { "temperature": "number", "date": "date" } },
                    "transform": [
                        { "type": "formula", "as": "hour", "expr": "hours(datum.date)" },
                        {
                            "type": "formula", "as": "day",
                            "expr": "datetime(year(datum.date), month(datum.date), date(datum.date))"
                        }
                    ]
                }
            ],

            "scales": [
                {
                    "name": "x",
                    "type": "time",
                    "domain": { "data": "temperature", "field": "day" },
                    "range": "width"
                },
                {
                    "name": "y",
                    "type": "band",
                    "domain": [
                        6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23,
                        0, 1, 2, 3, 4, 5
                    ],
                    "range": "height"
                },
                {
                    "name": "color",
                    "type": "linear",
                    "range": { "scheme": "Viridis" },
                    "domain": { "data": "temperature", "field": "temperature" },
                    "zero": false, "nice": true
                }
            ],

            "axes": [
                {
                    "orient": "bottom",
                    "scale": "x",
                    labelOverlap: true,
                    //values: xTicks(),
                    title: model.chartConfiguration.memoryChartXTitle,
                    titlePadding: model.chartConfiguration.axisPadding,
                    labelFontSize: model.chartConfiguration.axisLabelFontSize,
                    titleFontSize: model.chartConfiguration.axisTitleFontSize,
                    titleFont: model.chartConfiguration.axisTitleFont,
                    labelFont: model.chartConfiguration.axisLabelFont,
                    labelSeparation: model.chartConfiguration.memoryChartXLabelSeparation,
                },
                {
                    orient: "left",
                    scale: "y",
                    zindex: 1,
                    title: model.chartConfiguration.memoryChartYTitle,
                    titlePadding: model.chartConfiguration.axisPadding,
                    labelFontSize: model.chartConfiguration.axisLabelFontSize,
                    labelSeparation: model.chartConfiguration.memoryChartYLabelSeparation,
                    labelOverlap: true,
                    titleFontSize: model.chartConfiguration.axisTitleFontSize,
                    titleFont: model.chartConfiguration.axisTitleFont,
                    labelFont: model.chartConfiguration.axisLabelFont,
                }
            ],

            "marks": [
                {
                    "type": "rect",
                    "from": { "data": "temperature" },
                    "encode": {
                        "enter": {
                            "x": { "scale": "x", "field": "day" },
                            "y": { "scale": "y", "field": "hour" },
                            "width": { "value": 5 },
                            "height": { "scale": "y", "band": 1 },
                            //TODO Tooltip
                            "tooltip": { "signal": "timeFormat(datum.date, '%b %d %I:00 %p') + ': ' + datum.temperature + '°'" }
                        },
                        "update": {
                            "fill": { "scale": "color", "field": "temperature" }
                        }
                    }
                }
            ],

            "legends": [
                {
                    "fill": "color",
                    "type": "gradient",
                    "title": "Number of Accesses",
                    titleFontSize: model.chartConfiguration.legendTitleFontSize,
                    "titlePadding": 4,
                    "gradientLength": { "signal": "height - 20" }
                }
            ],
        } as VisualizationSpec;

        return spec;
    }



}

const mapStateToProps = (state: model.AppState) => ({
    resultLoading: state.resultLoading,
    result: state.result,
    csvParsingFinished: state.csvParsingFinished,
    currentChart: state.currentChart,
    currentEvent: state.currentEvent,
    events: state.events,
    chartIdCounter: state.chartIdCounter,
    chartData: state.chartData,
    currentPipeline: state.currentPipeline,
    currentOperator: state.currentOperator,
    operators: state.operators,
    currentTimeBucketSelectionTuple: state.currentTimeBucketSelectionTuple,
});

const mapDispatchToProps = (dispatch: model.Dispatch) => ({
    setCurrentChart: (newCurrentChart: string) => dispatch({
        type: model.StateMutationType.SET_CURRENTCHART,
        data: newCurrentChart,
    }),
    setChartIdCounter: (newChartIdCounter: number) => dispatch({
        type: model.StateMutationType.SET_CHARTIDCOUNTER,
        data: newChartIdCounter,
    })
});


export default connect(mapStateToProps, mapDispatchToProps)(Context.withAppContext(MemoryAccessHeatmapChart));
