import * as model from '../../model';
import * as Controller from '../../controller/request_controller';
import * as Context from '../../app_context';
import Spinner from '../utils/spinner';
import React from 'react';
import { connect } from 'react-redux';
import { SignalListeners, Vega } from 'react-vega';
import { VisualizationSpec } from "../../../node_modules/react-vega/src";
import { Redirect } from 'react-router-dom';
import { createRef } from 'react';
import DeleteSweepIcon from '@material-ui/icons/DeleteSweep';
import IconButton from "@material-ui/core/IconButton";

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
    currentTimePositionSelectionTuple: [number, number];
    setCurrentChart: (newCurrentChart: string) => void;
    setChartIdCounter: (newChartIdCounter: number) => void;
    setCurrentTimeBucketSelectionTuple: (newCurrentTimeBucketSelectionTuple: [number, number]) => void;
    setCurrentTimePositionSelectionTuple: (newCurrentTimePositionSelectionTuple: [number, number]) => void;

}

interface State {
    chartId: number,
    width: number,
}


class BarChartActivityHistogram extends React.Component<Props, State> {

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
        this.resetCurrentSelectionTuples = this.resetCurrentSelectionTuples.bind(this);
    }

    componentDidUpdate(prevProps: Props): void {

        this.requestNewChartData(this.props, prevProps);

    }

    requestNewChartData(props: Props, prevProps: Props): void {
        if (this.newChartDataNeeded(props, prevProps)) {
            Controller.requestChartData(props.appContext.controller, this.state.chartId, model.ChartType.BAR_CHART_ACTIVITY_HISTOGRAM);
        }
    }

    newChartDataNeeded(props: Props, prevProps: Props): boolean {
        if (props.currentEvent != prevProps.currentEvent
            || props.chartIdCounter != prevProps.chartIdCounter) {
            return true;
        } else {
            return false;
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
        if (!this.elementWrapper) return;

        const child = this.elementWrapper.current;
        if (child) {
            const newWidth = child.offsetWidth;

            child.style.display = 'none';

            this.setState((state, props) => ({
                ...state,
                width: newWidth,
            }));

            this.resetCurrentSelectionTuples();

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
                : <div className={"vegaContainer"} >
                    {this.props.currentTimeBucketSelectionTuple[0] >= 0 && <IconButton onClick={this.resetCurrentSelectionTuples} style={{ position: "absolute", left: 20, marginTop: -5, zIndex: 2 }}> <DeleteSweepIcon /> </IconButton>}
                    <Vega spec={this.createVisualizationSpec()} signalListeners={this.createVegaSignalListeners()} />
                </div>
            }
        </div>;
    }

    resetCurrentSelectionTuples() {
        this.props.setCurrentTimeBucketSelectionTuple([-1, -1]);
        this.props.setCurrentTimePositionSelectionTuple([-1, -1]);
    }

    createVegaSignalListeners() {
        const signalListeners: SignalListeners = {
            detailDomainRelease: this.handleDetailDomainSelection,
        }
        return signalListeners;
    }

    handleDetailDomainSelection(...args: any[]) {
        console.log(args);
        if (null === args[1] || null === args[1][0] || null === args[0][1]) {
            this.resetCurrentSelectionTuples();
        }
        else if (args[1] && args[1][0] && args[1][1]) {
            const selectedTimeBuckets = args[1][0];
            const selectedPosition = args[1][1]
            const timeBucketsFromTo: [number, number] = [selectedTimeBuckets[0], selectedTimeBuckets.at(-1)];
            const positionFromTo: [number, number] = [selectedPosition[0], selectedPosition.at(-1)];
            this.props.setCurrentTimeBucketSelectionTuple(timeBucketsFromTo);
            this.props.setCurrentTimePositionSelectionTuple(positionFromTo);
        }
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
            if (visData.bucketsArray.length > 50) {
                return Array.from(visData.bucketsArray.filter(bucket => bucket % 20 === 0));
            }
        }

        const selectionPos0 = this.props.currentTimePositionSelectionTuple[0];
        const selectionPos1 = this.props.currentTimePositionSelectionTuple[1];

        const spec: VisualizationSpec = {
            $schema: 'https://vega.github.io/schema/vega/v5.json',
            width: this.state.width - 60,
            height: 70,
            padding: { left: 5, right: 5, top: 5, bottom: 5 },
            autosize: { type: "fit", resize: true },
            title: {
                text: "Absolute Activity per Event over Time of Query Execution",
                align: model.chartConfiguration.titleAlign,
                dy: model.chartConfiguration.titlePadding,
                fontSize: model.chartConfiguration.titleFontSize,
                font: model.chartConfiguration.titleFont
            },

            data: [
                visData.data,
            ],

            signals: [
                {
                    name: "detailDomainRelease"
                }
            ],

            marks: [
                {
                    type: "group",

                    name: "overview",

                    encode: {
                        enter: {
                            height: { signal: "height" },
                            width: { signal: "width" },
                            fill: { value: "transparent" }
                        }
                    },

                    signals: [
                        {
                            name: "brush",
                            init: [selectionPos0, selectionPos1],
                            on: [
                                {
                                    events: [{ type: "mousedown", marktype: "group" }, { type: "mousedown", markname: "bars" }],
                                    update: "[x(), x()]"
                                },
                                {
                                    events: "[@overview:mousedown, window:mouseup] > window:mousemove!",
                                    update: "[brush[0], clamp(x(), 0, width)]"
                                },
                                {
                                    events: "[@bars:mousedown, window:mouseup] > window:mousemove!",
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
                            on: [
                                {
                                    events: { signal: "brush" },
                                    update: "span(brush) ? invert('xscale', [brush[0], brush[1]]) : null"
                                }
                            ]
                        },
                        {
                            name: "detailDomainPosition",
                            on: [
                                {
                                    events: { signal: "brush" },
                                    update: "span(brush) ? [brush[0], brush[1]] : null"
                                }
                            ]
                        },
                        {
                            name: "detailDomainRelease",
                            push: "outer",
                            on: [
                                {
                                    events: "view:mouseup",
                                    update: "[detailDomain, detailDomainPosition]"
                                }
                            ]
                        },
                        // {
                        //     name: "calcXScale0",
                        //     init: "scale('xscale'," + selection0 + ")"
                        // },
                        // {
                        //     name: "calcXScale1",
                        //     init: "scale('xscale'," + selection1 + ")"
                        // },
                    ],

                    scales: [
                        {
                            name: 'xscale',
                            type: 'band',
                            domain: { data: 'table', field: 'timeBuckets' },
                            range: 'width',
                            align: 0.5,
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
                            title: model.chartConfiguration.activityHistogramXTitle,
                            titleY: -5,
                            titleX: { signal: 'width', mult: 1.01 },
                            titleAlign: "left",
                            titleFontSize: model.chartConfiguration.axisTitleFontSize,
                            titleFont: model.chartConfiguration.axisTitleFont,
                            /* encode: {
                                labels: {
                                    update: {
                                        angle: { value: -45 },
                                        align: { value: "right" }
                                    }
                                }
                            }, */
                            values: xTicks(),
                            labelFontSize: model.chartConfiguration.activityHistogramXLabelFontSize,
                            labelFont: model.chartConfiguration.axisLabelFont
                        },
                    ],

                    marks: [
                        {
                            name: 'bars',
                            type: 'rect',
                            from: { data: 'table' },
                            encode: {
                                enter: {
                                    tooltip:
                                    {
                                        signal: model.chartConfiguration.activityHistogramTooltip,
                                    }
                                },
                                update: {
                                    x: { scale: 'xscale', field: 'timeBuckets', offset: 1 },
                                    width: { scale: 'xscale', band: 1, offset: -1 },
                                    y: { scale: 'yscale', field: 'occurrences' },
                                    y2: { scale: 'yscale', value: 0 },
                                    fill: { value: this.props.appContext.tertiaryColor },
                                },
                                hover: {
                                    fill: { value: this.props.appContext.secondaryColor },
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
                                    fill: { value: this.props.appContext.secondaryColor }
                                },
                                update: {
                                    x: { signal: "brush[0]" },
                                    fillOpacity: [
                                        { test: "brush[0] < 0", value: 0 },
                                        { test: "brush[0]", value: 1 },
                                        { test: "brush[0] == 0", value: 1 },
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
                                    fill: { value: this.props.appContext.secondaryColor }
                                },
                                update: {
                                    x: { signal: "brush[1]" },
                                    fillOpacity: [
                                        { test: "brush[1] < 0", value: 0 },
                                        { test: "brush[1]", value: 1 },
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
    currentTimePositionSelectionTuple: state.currentTimePositionSelectionTuple,
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
    }),
    setCurrentTimePositionSelectionTuple: (newCurrentTimePositionSelectionTuple: [number, number]) => dispatch({
        type: model.StateMutationType.SET_CURRENTTIMEPOSITIONSELECTIONTUPLE,
        data: newCurrentTimePositionSelectionTuple,
    })
});


export default connect(mapStateToProps, mapDispatchToProps)(Context.withAppContext(BarChartActivityHistogram));
