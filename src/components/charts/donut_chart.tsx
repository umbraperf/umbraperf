import * as model from '../../model';
import React from 'react';
import { connect } from 'react-redux';
import { IAppContext, withAppContext } from '../../app_context';
import { SignalListeners, Vega } from 'react-vega';
import { Result } from 'src/model/core_result';
import { VisualizationSpec } from "react-vega/src";
import { Redirect } from 'react-router-dom';
import { createRef } from 'react';
import { CircularProgress } from '@material-ui/core';
import { requestPipelines } from '../../controller/request_controller';
import * as RestApi from '../../model/rest_queries';
import { requestChartData } from '../../controller/request_controller'

interface Props {
    appContext: IAppContext;
    resultLoading: model.ResultLoading;
    result: Result | undefined;
    csvParsingFinished: boolean;
    currentChart: string;
    currentEvent: string;
    currentRequest: RestApi.RestQueryType | undefined;
    events: Array<string> | undefined;
    chartIdCounter: number;
    chartData: model.ChartDataKeyValue,
    currentPipeline: Array<string> | undefined;
    pipelines: Array<string> | undefined;
    setCurrentChart: (newCurrentChart: string) => void;
    setChartIdCounter: (newChartIdCounter: number) => void;
    setCurrentPipeline: (newCurrentPipeline: Array<string>) => void;

}

interface State {
    chartId: number,
    width: number,
    height: number,
}

const startSize = {
    width: 450,
    height: window.innerHeight > 1000 ? 500 : window.innerHeight - 500,
}

class DonutChart extends React.Component<Props, State> {

    chartWrapper = createRef<HTMLDivElement>();

    constructor(props: Props) {
        super(props);
        this.state = {
            chartId: this.props.chartIdCounter,
            width: startSize.width,
            height: startSize.height,
        };
        this.props.setChartIdCounter((this.state.chartId) + 1);

        this.createVisualizationSpec = this.createVisualizationSpec.bind(this);
        this.handleCklickPipeline = this.handleCklickPipeline.bind(this);
    }

    componentDidUpdate(prevProps: Props): void {

        //if current event or chart changes, component did update is executed and queries new data for new event, only if curent event already set
        if (this.props.currentEvent && (this.props.currentEvent != prevProps.currentEvent || this.props.chartIdCounter != prevProps.chartIdCounter)) {
            requestChartData(this.props.appContext.controller, this.state.chartId, model.ChartType.DONUT_CHART);
        }

    }

    componentDidMount() {
        if (this.props.csvParsingFinished) {
            this.props.setCurrentChart(model.ChartType.DONUT_CHART);

            if (!this.props.currentPipeline) {
                requestPipelines(this.props.appContext.controller);
            }

            addEventListener('resize', (event) => {
                this.resizeListener();
            });
        }
    }

    resizeListener() {
        if (!this.chartWrapper) return;

        const child = this.chartWrapper.current;
        if (child) {
            const newWidth = child.clientWidth;
            const newHeight = child.clientHeight;

            child.style.display = 'none';

            this.setState((state, props) => ({
                ...state,
                width: newWidth > startSize.width ? startSize.width : newWidth,
                height: newHeight > startSize.height ? startSize.height : newHeight,
            }));

            child.style.display = 'block';
        }


    }


    public render() {

        if (!this.props.csvParsingFinished) {
            return <Redirect to={"/upload"} />
        }

        return <div>
            {(this.props.resultLoading[this.state.chartId] || !this.props.chartData[this.state.chartId] || !this.props.events)
                ? <CircularProgress />
                : <div className={"vegaContainer"} ref={this.chartWrapper}>
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
        if (undefined !== this.props.currentPipeline) {
            if (this.props.currentPipeline?.includes(selectedPipeline)) {
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
                    type: "formula",
                    expr: "datum.pipeline + ': ' + datum.value",
                    as: "tooltip"
                },
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
            width: this.state.width,
            height: this.state.height,
            padding: { left: 5, right: 5, top: 5, bottom: 5 },
            resize: false,
            autosize: 'fit',

            data: visData,

            signals: [
                {
                    name:"radius",
                    update:"width / 3.1"
                },
                {
                    name: "clickPipeline",
                    on: [
                        { events: "arc:click", update: "datum" }
                    ]
                },
                {
                    name: "hover",
                    on: [
                        { "events": "mouseover", "update": "datum" }
                    ]
                }
            ],

            scales: [
                {
                    "name": "color",
                    "type": "ordinal",
                    "domain": { "data": "table", "field": "pipeline" },
                    "range": { "scheme": "category20c" }
                },
                {
                    "name": "r",
                    "type": "sqrt",
                    "domain": {"data": "table", "field": "value"},
                    "zero": true,
                    "range": [100, 100]
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
                            "tooltip": { "field": "tooltip" }
                        },
                        "update": {
                            "opacity": [
                                { "test": "indata('selected', 'pipelinesUsed', datum.pipeline)", "value": 1 },
                                { "value": 0.1 }
                            ],
                            "startAngle": { "field": "startAngle" },
                            "endAngle": { "field": "endAngle" },
                            "padAngle": {
                                "signal": "if(hover && hover.pipeline == datum.pipeline, 0.015, 0.015)"
                            },
                            "innerRadius": {
                                "signal": "if(hover && hover.pipeline == datum.pipeline, if(width >= height, height, width) / 2 * 0.45, if(width >= height, height, width) / 2 * 0.5)"
                            },
                            "outerRadius": {
                                "signal": "if(hover && hover.pipeline == datum.pipeline, if(width >= height, height, width) / 2 * 1.05 * 0.8, if(width >= height, height, width) / 2 * 0.8)"
                            },
                            "stroke": { "signal": "scale('color', datum.pipeline)" },
                            "fillOpacity": {
                                "signal": "if(hover && hover.pipeline == datum.pipeline, 0.8, 0.8)"
                            }
                        }
                    }
                },
                {
                  "type": "text",
                  "from": {"data": "table"},
                  "encode": {
                    "update": {
                      "x": {"field": {"group": "width"}, "mult": 0.5},
                      "y": {"field": {"group": "height"}, "mult": 0.5},
                      "radius": {"signal": "radius"},
                      "theta": {"signal": "(datum.startAngle + datum.endAngle)/2"},
                      "fill": {"value": "#000"},
                      "align": {"value": "center"},
                      "baseline": {"value": "middle"},
                      "text": {"signal":  "if(datum['endAngle'] - datum['startAngle'] < 0.3, '', format(datum['value'] , '.0f'))"},
                      "fillOpacity":  [
                          {"test":  "radius < 40", "value": 0},
                          {"value" : 1}
                      ]
                    }
                  }
                }
            ],
            legends: [{
                fill: "color",
                title: "Pipelines",
                orient: "right",
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


export default connect(mapStateToProps, mapDispatchToProps)(withAppContext(DonutChart));
