import * as model from '../../model';
import * as Controller from '../../controller/request_controller';
import * as Context from '../../app_context';
import React from 'react';
import { connect } from 'react-redux';
import { Vega } from 'react-vega';
import { VisualizationSpec } from "../../../node_modules/react-vega/src";
import { Redirect } from 'react-router-dom';
import { createRef } from 'react';
import { CircularProgress } from '@material-ui/core';
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
    currentPipeline: Array<string> | undefined,
    currentTimeBucketSelectionTuple: [number, number],
    setCurrentChart: (newCurrentChart: string) => void;
    setChartIdCounter: (newChartIdCounter: number) => void;

    //TODO remove:
    onDashboard?: boolean;

}

interface State {
    chartId: number,
    width: number,
    height: number,
}

const startSize = {
    width: 500,
    height: window.innerHeight > 1000 ? 500 : window.innerHeight - 300,
}

class BarChart extends React.Component<Props, State> {

    chartWrapper = createRef<HTMLDivElement>();
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

        //if current event, chart, timeframe or pipelines change, component did update is executed and queries new data for new event and pipelines selected only if current event and current pipelines already set
        if (this.props.currentEvent &&
            this.props.currentPipeline &&
            (this.props.currentEvent !== prevProps.currentEvent ||
                this.props.chartIdCounter !== prevProps.chartIdCounter ||
                this.props.currentPipeline?.length !== prevProps.currentPipeline?.length ||
                !_.isEqual(this.props.currentTimeBucketSelectionTuple, prevProps.currentTimeBucketSelectionTuple))) {

            Controller.requestChartData(this.props.appContext.controller, this.state.chartId, model.ChartType.BAR_CHART, { pipeline: this.props.currentPipeline, timeBucketFrame: this.props.currentTimeBucketSelectionTuple });
        }

    }

    componentDidMount() {

        this.setState((state, props) => ({
            ...state,
            width: this.elementWrapper.current!.offsetWidth,
            height: this.elementWrapper.current!.clientHeight,
        }));

        if (this.props.csvParsingFinished) {
            this.props.setCurrentChart(model.ChartType.BAR_CHART);

            if (!this.props.currentPipeline) {
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
                width: newWidth > startSize.width ? startSize.width : newWidth,
            }));

            child.style.display = 'block';
        }


    }


    public render() {

        if (!this.props.csvParsingFinished) {
            return <Redirect to={"/upload"} />
        }

        return <div ref={this.elementWrapper} style={{height: "100%"}}>
            {(this.props.resultLoading[this.state.chartId] || !this.props.chartData[this.state.chartId] || !this.props.events)
                ? <CircularProgress />
                : <div className={"vegaContainer"} ref={this.chartWrapper} >
                    <Vega spec={this.createVisualizationSpec()} />
                </div>
            }
        </div>;
    }

    createVisualizationData() {

        const operatorsArray = ((this.props.chartData[this.state.chartId] as model.ChartDataObject).chartData.data as model.IBarChartData).operators;
        const valueArray = ((this.props.chartData[this.state.chartId] as model.ChartDataObject).chartData.data as model.IBarChartData).frequency;

        const data = {

            transform: [{ type: "flatten", fields: ["operators", "values"] }],
            name: "table",
            values: [
                { operators: operatorsArray, values: valueArray }
            ]
        };


        return data;
    }

    createVisualizationSpec() {
        const visData = this.createVisualizationData();

        const spec: VisualizationSpec = {
            $schema: 'https://vega.github.io/schema/vega/v5.json',
            width: this.state.width - 50,
            height: this.state.height - 10,
            padding: { left: 5, right: 5, top: 5, bottom: 5 },
            resize: true,
            autosize: 'fit',
            title: {
                text: "Absolute Occurence of Operators per Event",
                align: model.chartConfiguration.titleAlign,
                dy: model.chartConfiguration.titlePadding,
                fontSize: model.chartConfiguration.titleFontSize,
                font: model.chartConfiguration.titleFont
            },

            data: [
                visData,
            ],

            scales: [
                {
                    name: 'xscale',
                    type: 'band',
                    domain: { data: 'table', field: 'operators' },
                    range: 'width',
                },
                {
                    name: 'yscale',
                    domain: { data: 'table', field: 'values' },
                    nice: true,
                    range: 'height',
                },
            ],

            axes: [
                {
                    orient: 'bottom',
                    scale: 'xscale',
                    labelOverlap: true,
                    title: "Operators",
                    titleY: -5,
                    titleX: { signal: 'width', mult: 1.02 },
                    titleAlign: "left",
                    titleFontSize: model.chartConfiguration.axisTitleFontSize,
                    titleFont: model.chartConfiguration.axisTitleFont,
                    labelFontSize: model.chartConfiguration.axisLabelFontSize,
                    labelFont: model.chartConfiguration.axisLabelFont,
                    encode: {
                        labels: {
                            update: {
                                text: { signal: "truncate(datum.value, 9)" },
                                angle: { value: -45 },
                                align: { value: "right" }
                            }
                        }
                    }
                },
                {
                    orient: 'left',
                    titlePadding: model.chartConfiguration.axisPadding,
                    scale: 'yscale',
                    title: "Absolute Frequency",
                    labelFontSize: model.chartConfiguration.axisLabelFontSize,
                    labelSeparation: model.chartConfiguration.barChartYLabelSeparation,
                    labelOverlap: false,
                    titleFontSize: model.chartConfiguration.axisTitleFontSize,
                    titleFont: model.chartConfiguration.axisTitleFont,
                    labelFont: model.chartConfiguration.axisLabelFont,
                },
            ],

            marks: [
                {
                    name: 'bars',
                    type: 'rect',
                    from: { data: 'table' },
                    encode: {
                        enter: {
                            x: { scale: 'xscale', field: 'operators', offset: 1 },
                            width: { scale: 'xscale', band: 1, offset: -1 },
                            y: { scale: 'yscale', field: 'values' },
                            y2: { scale: 'yscale', value: 0 },
                            tooltip:{
                                signal: model.chartConfiguration.barChartTooltip,
                            }
                        },
                        update: {
                            fill: { value: this.props.appContext.primaryColor },
                        },
                        hover: {
                            fill: { value: this.props.appContext.secondaryColor },
                        },
                    },
                },
                {
                    type: "text",
                    from: { data: "bars" },
                    encode: {
                        enter: {
                            x: { field: "x", offset: { field: "width", mult: 0.5 } },
                            y: { field: "y", offset: -7 },
                            fill: [
                                { test: "contrast('white', datum.fill) > contrast('black', datum.fill)", "value": "white" },
                                { value: "black" }
                            ],
                            align: { value: "center" },
                            baseline: { value: "middle" },
                            text: { field: "datum.values" }
                        }
                    }
                },
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
});


export default connect(mapStateToProps, mapDispatchToProps)(Context.withAppContext(BarChart));
