import * as model from '../../model';
import * as Controller from '../../controller/request_controller';
import * as Context from '../../app_context';
import React from 'react';
import { connect } from 'react-redux';
import { SignalListeners, Vega } from 'react-vega';
import { VisualizationSpec } from "../../../node_modules/react-vega/src";
import { Redirect } from 'react-router-dom';
import { createRef } from 'react';
import { CircularProgress } from '@material-ui/core';
import { values } from 'lodash';

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
    currentTimeBucketSelectionTuple: [number, number];
    setCurrentChart: (newCurrentChart: string) => void;
    setChartIdCounter: (newChartIdCounter: number) => void;
    setCurrentTimeBucketSelectionTuple: (newCurrentTimeBucketSelectionTuple: [number, number]) => void;

}

interface State {
    chartId: number,
    width: number,
}


class BarChartActivityHistogram extends React.Component<Props, State> {

    chartWrapper = createRef<HTMLDivElement>();
    elementWrapper = createRef<HTMLDivElement>();


    constructor(props: Props) {
        super(props);
        this.state = {
            chartId: this.props.chartIdCounter,
            width: 0,
        };
        this.props.setChartIdCounter((this.state.chartId) + 1);

        this.createVisualizationSpec = this.createVisualizationSpec.bind(this);
        this.handleDetailDomainSelection = this.handleDetailDomainSelection.bind(this);
    }

    componentDidUpdate(prevProps: Props): void {

        //if current event or chart change, component did update is executed and queries new data for new event selected only if current event already set
        if (this.props.currentEvent && (this.props.currentEvent != prevProps.currentEvent || this.props.chartIdCounter != prevProps.chartIdCounter)) {
            Controller.requestChartData(this.props.appContext.controller, this.state.chartId, model.ChartType.BAR_CHART_ACTIVITY_HISTOGRAM);
        }

    }

    componentDidMount() {

        this.setState((state, props) => ({
            ...state,
            width: this.elementWrapper.current!.offsetWidth,
        }));

        if (this.props.csvParsingFinished) {
            this.props.setCurrentChart(model.ChartType.BAR_CHART_ACTIVITY_HISTOGRAM);

            addEventListener('resize', (event) => {
                this.resizeListener();
            });
        }
    }

    resizeListener() {
        if (!this.chartWrapper) return;

        const child = this.chartWrapper.current;
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


    public render() {

        if (!this.props.csvParsingFinished) {
            return <Redirect to={"/upload"} />
        }

        return <div ref={this.elementWrapper}>
            {(this.props.resultLoading[this.state.chartId] || !this.props.chartData[this.state.chartId] || !this.props.events)
                ? <CircularProgress />
                : <div className={"vegaContainer"} ref={this.chartWrapper} >
                    <Vega spec={this.createVisualizationSpec()} signalListeners={this.createVegaSignalListeners()}/>
                </div>
            }
        </div>;
    }

    createVegaSignalListeners() {
        const signalListeners: SignalListeners = {
            detailDomain: this.handleDetailDomainSelection,
        }
        return signalListeners;
    }

    handleDetailDomainSelection(...args: any[]) {
        if (args[1]) {
            const selectedFrame = args[1];
            const bucketsFromTo: [number, number] = [selectedFrame[0], selectedFrame.at(-1)];
            setTimeout(() => {
                this.props.setCurrentTimeBucketSelectionTuple(bucketsFromTo);
            }, 1000);
            console.log(this.props.currentTimeBucketSelectionTuple)
        }
        //TODO values selected from args[1]: add to swim lanes queries, rerender swimlanes (and bar charts?) on change in store. Controller has already field in params for request chart data!
    }

    createVisualizationData() {

        const timeBucketsArray = ((this.props.chartData[this.state.chartId] as model.ChartDataObject).chartData.data as model.IBarChartActivityHistogramData).timeBucket;
        const occurrencesArray = ((this.props.chartData[this.state.chartId] as model.ChartDataObject).chartData.data as model.IBarChartActivityHistogramData).occurrences;

        const data = {

            transform: [{ type: "flatten", fields: ["timeBuckets", "occurrences"] }],
            name: "table",
            values: [
                { timeBuckets: timeBucketsArray, occurrences: occurrencesArray }
            ]
        };


        return { data: data, bucketsArray: timeBucketsArray };
    }

    createVisualizationSpec() {
        const visData = this.createVisualizationData();

        const xTicks = () => {
            if (visData.bucketsArray.length > 100) {
                return Array.from(visData.bucketsArray.filter(bucket => bucket % 10 === 0));
            }
        }

        const spec: VisualizationSpec = {
            $schema: 'https://vega.github.io/schema/vega/v5.json',
            width: this.state.width - 50,
            height: 120,
            padding: { left: 5, right: 5, top: 5, bottom: 5 },
            resize: true,
            autosize: 'fit',
            title: {
                text: "Absolute Activity per Event over Time of Query Execution",
                align: model.chartConfiguration.titleAlign,
                dy: model.chartConfiguration.titlePadding,
            },

            data: [
                visData.data,
            ],

            signals: [
                {
                    name: "detailDomain"
                }
            ],

            marks: [
                {
                    type: "group",

                    name: "overview",

                    encode: {
                        "enter": {
                            "height": { "signal": "height" },
                            "width": { "signal": "width" },
                            "fill": { "value": "transparent" }
                        }
                    },

                    signals: [
                        {
                            name: "brush",
                            value: 0,
                            on: [
                                {
                                    events: "@overview:mousedown",
                                    update: "[x(), x()]"
                                },
                                {
                                    events: "[@overview:mousedown, window:mouseup] > window:mousemove!",
                                    update: "[brush[0], clamp(x(), 0, width)]"
                                },
                                {
                                    events: { signal: "delta" },
                                    update: "clampRange([anchor[0] + delta, anchor[1] + delta], 0, width)"
                                }
                            ]
                        },
                        {
                            name: "anchor",
                            value: null,
                            on: [{ events: "@brush:mousedown", update: "slice(brush)" }]
                        },
                        {
                            name: "xdown",
                            value: 0,
                            on: [{ events: "@brush:mousedown", update: "x()" }]
                        },
                        {
                            name: "delta",
                            value: 0,
                            on: [
                                {
                                    events: "[@brush:mousedown, window:mouseup] > window:mousemove!",
                                    update: "x() - xdown"
                                }
                            ]
                        },
                        {
                            name: "detailDomain",
                            push: "outer",
                            on: [
                                {
                                    events: { signal: "brush" },
                                    update: "span(brush) ? invert('xscale', brush) : null"
                                }
                            ]
                        }
                    ],

                    scales: [
                        {
                            name: 'xscale',
                            type: 'band',
                            domain: { data: 'table', field: 'timeBuckets' },
                            range: 'width',
                        },
                        {
                            name: 'yscale',
                            domain: { data: 'table', field: 'occurrences' },
                            nice: true,
                            range: 'height',
                        },
                    ],

                    axes: [
                        {
                            orient: 'bottom',
                            scale: 'xscale',
                            labelOverlap: false,
                            title: "Execution Time",
                            titlePadding: model.chartConfiguration.axisPadding,
                            encode: {
                                labels: {
                                    update: {
                                        angle: { value: -80 },
                                        align: { value: "right" }
                                    }
                                }
                            },
                            values: xTicks(),
                            labelFontSize: 8
                        },
                    ],

                    marks: [
                        {
                            name: 'bars',
                            type: 'rect',
                            from: { data: 'table' },
                            encode: {
                                enter: {
                                    x: { scale: 'xscale', field: 'timeBuckets', offset: 1 },
                                    width: { scale: 'xscale', band: 1, offset: -1 },
                                    y: { scale: 'yscale', field: 'occurrences' },
                                    y2: { scale: 'yscale', value: 0 },
                                    tooltip:
                                    {
                                        signal: "{'Time': datum.timeBuckets, 'Occurences': datum.occurrences}"
                                    }
                                },
                                update: {
                                    fill: { value: this.props.appContext.secondaryColor },
                                },
                                hover: {
                                    fill: { value: this.props.appContext.primaryColor },
                                },
                            },
                        },
                        {
                            type: "rect",
                            name: "brush",
                            encode: {
                                enter: {
                                    y: { "value": 0 },
                                    height: { "signal": "height" },
                                    fill: { "value": "#333" },
                                    fillOpacity: { "value": 0.3 },
                                },
                                update: {
                                    x: { "signal": "brush[0]" },
                                    x2: { "signal": "brush[1]" },
                                }
                            }
                        },
                        {
                            type: "rect",
                            interactive: false,
                            encode: {
                                enter: {
                                    y: { value: 0 },
                                    height: { signal: "height" },
                                    width: { value: 2 },
                                    fill: { value: this.props.appContext.primaryColor }
                                },
                                update: {
                                    x: { signal: "brush[0]" },
                                    fillOpacity: [
                                        { test: "detailDomain", value: 1 },
                                        { value: 0 }
                                    ]
                                }
                            }
                        },
                        {
                            type: "rect",
                            interactive: false,
                            encode: {
                                enter: {
                                    y: { value: 0 },
                                    height: { signal: "height" },
                                    width: { value: 2 },
                                    fill: { value: this.props.appContext.primaryColor }
                                },
                                update: {
                                    x: { signal: "brush[1]" },
                                    fillOpacity: [
                                        { test: "detailDomain", value: 1 },
                                        { value: 0 }
                                    ]
                                }
                            }
                        }
                    ],

                }
            ]

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
    setCurrentTimeBucketSelectionTuple: (newCurrentTimeBucketSelectionTuple: [number, number]) => dispatch({
        type: model.StateMutationType.SET_CURRENTTIMEBUCKETSELECTIONTUPLE,
        data: newCurrentTimeBucketSelectionTuple,
    })
});


export default connect(mapStateToProps, mapDispatchToProps)(Context.withAppContext(BarChartActivityHistogram));
