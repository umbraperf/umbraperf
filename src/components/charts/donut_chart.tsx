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
    currentRequest: model.RestQueryType | undefined;
    events: Array<string> | undefined;
    chartIdCounter: number;
    chartData: model.ChartDataKeyValue,
    currentPipeline: Array<string> | "All";
    pipelines: Array<string> | undefined;
    currentTimeBucketSelectionTuple: [number, number],
    setCurrentChart: (newCurrentChart: string) => void;
    setChartIdCounter: (newChartIdCounter: number) => void;
    setCurrentPipeline: (newCurrentPipeline: Array<string>) => void;

}

interface State {
    chartId: number,
    width: number,
    height: number,
}

class DonutChart extends React.Component<Props, State> {

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
        this.handleCklickPipeline = this.handleCklickPipeline.bind(this);
    }

    componentDidUpdate(prevProps: Props): void {

        this.requestNewChartData(this.props, prevProps);

    }

    requestNewChartData(props: Props, prevProps: Props): void {
        if (this.newChartDataNeeded(props, prevProps)) {
            Controller.requestChartData(props.appContext.controller, this.state.chartId, model.ChartType.DONUT_CHART);
        }
    }

    newChartDataNeeded(props: Props, prevProps: Props): boolean {
        if (prevProps.currentEvent !== "Default" &&
            (props.currentEvent !== prevProps.currentEvent ||
                props.chartIdCounter !== prevProps.chartIdCounter ||
                !_.isEqual(props.currentTimeBucketSelectionTuple, prevProps.currentTimeBucketSelectionTuple))) {
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
            this.props.setCurrentChart(model.ChartType.DONUT_CHART);

            if (undefined === this.props.pipelines) {
                Controller.requestPipelines(this.props.appContext.controller);
            }

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
        if (this.props.resultLoading[this.state.chartId] || !this.props.chartData[this.state.chartId]) {
            return true;
        } else {
            return false;
        }
    }


    public render() {

        if (!this.props.csvParsingFinished) {
            return <Redirect to={"/upload"} />
        }

        return <div ref={this.elementWrapper} style={{ display: "flex", height: "100%" }}>
            {this.isComponentLoading()
                ? <Spinner />
                : <div className={"vegaContainer"}>
                    <Vega spec={this.createVisualizationSpec()} signalListeners={this.createVegaSignalListeners()} />
                </div>
            }
        </div>;
    }

    createVegaSignalListeners() {
        const signalListeners: SignalListeners = {
            clickPipeline: this.handleCklickPipeline,
        }
        return signalListeners;
    }

    handleCklickPipeline(...args: any[]) {
        const selectedPipeline = args[1].pipeline;
        if (this.props.currentPipeline === "All") {
            this.props.setCurrentPipeline(this.props.pipelines!.filter(e => e !== selectedPipeline));
        } else {
            if (this.props.currentPipeline.includes(selectedPipeline)) {
                this.props.setCurrentPipeline(this.props.currentPipeline.filter(e => e !== selectedPipeline));
            } else {
                this.props.setCurrentPipeline(this.props.currentPipeline!.concat(selectedPipeline));
            }
        }
    }

    createVisualizationData() {

        const pipelinesArray = ((this.props.chartData[this.state.chartId] as model.ChartDataObject).chartData.data as model.IDonutChartData).pipeline;
        const countArray = ((this.props.chartData[this.state.chartId] as model.ChartDataObject).chartData.data as model.IDonutChartData).count;

        let dataArray: { pipeline: string; value: number; }[] = [];
        pipelinesArray.forEach((elem, index) => {
            const dataObject = { pipeline: elem, value: countArray[index] };
            dataArray.push(dataObject);
        });

        const data = [{
            name: "table",
            values: dataArray,
            transform: [
                {
                    type: "pie",
                    field: "value",
                    startAngle: 0,
                    endAngle: 6.29,
                    sort: true
                }
            ]
        },
        {
            name: "selected",
            values: { pipelinesUsed: this.props.currentPipeline },
            transform: [{ type: "flatten", fields: ["pipelinesUsed"] }]
        }
        ]


        return data;
    }

    createVisualizationSpec() {
        const visData = this.createVisualizationData();

        const spec: VisualizationSpec = {
            $schema: "https://vega.github.io/schema/vega/v5.json",
            width: this.state.width - 50,
            height: this.state.height - 10,
            padding: { left: 5, right: 5, top: 5, bottom: 5 },
            resize: false,
            autosize: 'fit',

            title: {
                text: "Shares of Pipelines",
                align: model.chartConfiguration.titleAlign,
                dy: model.chartConfiguration.titlePadding,
                fontSize: model.chartConfiguration.titleFontSize,
                font: model.chartConfiguration.titleFont,
                subtitle: "Toggle pipelines by selecting them in donut:",
                subtitleFontSize: model.chartConfiguration.subtitleFontSize,
            },

            data: visData,

            signals: [
                {
                    name: "radius",
                    update: "width / 3.1"
                },
                {
                    name: "clickPipeline",
                    on: [
                        { events: { marktype: "arc", type: "click" }, update: "datum" }
                    ]
                },
                {
                    name: "hover",
                    on: [
                        { "events": "mouseover", "update": "datum" }
                    ]
                },
                {
                    name: "selectedPipelines",
                    value: this.props.currentPipeline,
                },
                {
                    name: "initialAllSelected",
                    update: "isString(selectedPipelines)",
                }
            ],

            scales: [
                {
                    "name": "color",
                    "type": "ordinal",
                    "domain": { "data": "table", "field": "pipeline" },
                    "range": { "scheme": model.chartConfiguration.pipelineColorSceme } //old: category20c
                }
            ],

            marks: [
                {
                    "name": "arc",
                    "type": "arc",
                    "from": { "data": "table" },
                    "encode": {
                        "enter": {
                            "fill": { "scale": "color", "field": "pipeline" },
                            "x": { "signal": "width / 2" },
                            "y": { "signal": "height / 2" },
                            "startAngle": { "field": "startAngle" },
                            "endAngle": { "field": "endAngle" },
                            "innerRadius": { "value": 60 },
                            "outerRadius": { "signal": "width / 2" },
                            "cornerRadius": { "value": 0 },
                            "tooltip": {
                                signal: model.chartConfiguration.donutChartTooltip,
                            }
                        },
                        "update": {
                            "opacity": [
                                { "test": "initialAllSelected", "value": 1 }, //initially show all pipelines as selected
                                { "test": "datum['value'] === 0", "value": 0 }, //Hide if no pipeline appearance 
                                { "test": "indata('selected', 'pipelinesUsed', datum.pipeline)", "value": 1 }, //full color if pipeline selected
                                { "value": 0.1 } //lower opacity if pipeline not selected
                            ],
                            "padAngle": {
                                "signal": "if(hover && hover.pipeline == datum.pipeline, 0.015, 0.015)"
                            },
                            "innerRadius": {
                                "signal": "if(hover && hover.pipeline == datum.pipeline, if(width >= height, height, width) / 2 * 0.45, if(width >= height, height, width) / 2 * 0.5)"
                            },
                            "outerRadius": {
                                "signal": "if(hover && hover.pipeline == datum.pipeline, if(width >= height, height, width) / 2 * 1.05 * 0.8, if(width >= height, height, width) / 2 * 0.8)"
                            },
                            "stroke": { "signal": "scale('color', datum.pipeline)" }
                        }
                    }
                },
                {
                    "type": "text",
                    "from": { "data": "table" },
                    "encode": {
                        "enter": {
                            fontSize: { value: model.chartConfiguration.donutChartValueLabelFontSize },
                            font: model.chartConfiguration.valueLabelFont,
                            "x": { "signal": "if(width >= height, width, height) / 2" },
                            "y": { "signal": "if(width >= height, height, width) / 2" },
                            "radius": { "signal": "if(width >= height, height, width) / 2 * 1.02 * 0.65" },
                            "theta": { "signal": "(datum['startAngle'] + datum['endAngle'])/2" },
                            "fill": { "value": "#000" },
                            "align": { "value": "center" },
                            "baseline": { "value": "middle" },
                            "text": { "signal": "if(datum['endAngle'] - datum['startAngle'] < 0.3, '', format(datum['value'] , '.0f'))" },
                            "fillOpacity": [
                                { "test": "radius < 30", "value": 0 },
                                { "test": "datum['value'] === 0", "value": 0 },
                                { "value": 1 }
                            ],
                        }
                    }
                }
            ],
            legends: [{
                fill: "color",
                title: "Pipelines",
                orient: "right",
                labelFontSize: model.chartConfiguration.legendLabelFontSize,
                titleFontSize: model.chartConfiguration.legendTitleFontSize,
                symbolSize: model.chartConfiguration.legendSymbolSize,
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
    currentRequest: state.currentRequest,
    events: state.events,
    chartIdCounter: state.chartIdCounter,
    chartData: state.chartData,
    currentPipeline: state.currentPipeline,
    pipelines: state.pipelines,
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
    }),
    setCurrentPipeline: (newCurrentPipeline: Array<string>) => dispatch({
        type: model.StateMutationType.SET_CURRENTPIPELINE,
        data: newCurrentPipeline,
    }),
});


export default connect(mapStateToProps, mapDispatchToProps)(Context.withAppContext(DonutChart));
