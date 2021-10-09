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
    setCurrentChart: (newCurrentChart: string) => void;
    setChartIdCounter: (newChartIdCounter: number) => void;
    setCurrentTimeBucketSelectionTuple: (newCurrentTimeBucketSelectionTuple: [number, number]) => void;

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
        this.resetCurrentSelectionTuple = this.resetCurrentSelectionTuple.bind(this);
    }

    componentDidUpdate(prevProps: Props): void {

        //if current event or chart change, component did update is executed and queries new data for new event selected only if current event already set
        if (this.props.currentEvent &&
            (this.props.currentEvent != prevProps.currentEvent
                || this.props.chartIdCounter != prevProps.chartIdCounter)) {
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
        if (!this.elementWrapper) return;

        const child = this.elementWrapper.current;
        if (child) {
            const newWidth = child.offsetWidth;

            child.style.display = 'none';

            this.setState((state, props) => ({
                ...state,
                width: newWidth,
            }));

            this.resetCurrentSelectionTuple();

            child.style.display = 'block';
        }


    }


    public render() {

        if (!this.props.csvParsingFinished) {
            return <Redirect to={"/upload"} />
        }

        return <div ref={this.elementWrapper} style={{ display: "flex", height: "100%" }}>
            {(this.props.resultLoading[this.state.chartId] || !this.props.chartData[this.state.chartId] || !this.props.events)
                ? <Spinner />
                : <div className={"vegaContainer"} >
                    {this.props.currentTimeBucketSelectionTuple[0] >= 0 && <IconButton onClick={this.resetCurrentSelectionTuple} style={{ position: "absolute", left: 20, marginTop: -5, zIndex: 2 }}> <DeleteSweepIcon /> </IconButton>}
                    <Vega spec={this.createVisualizationSpec()} signalListeners={this.createVegaSignalListeners()} />
                </div>
            }
        </div>;
    }

    resetCurrentSelectionTuple() {
        this.props.setCurrentTimeBucketSelectionTuple([-1, -1]);
    }

    createVegaSignalListeners() {
        const signalListeners: SignalListeners = {
            detailDomainRelease: this.handleDetailDomainSelection,
        }
        return signalListeners;
    }

    handleDetailDomainSelection(...args: any[]) {
        if (null === args[1]) {
            this.resetCurrentSelectionTuple();
        }
        else if (args[1]) {
            const selectedFrame = args[1];
            const bucketsFromTo: [number, number] = [selectedFrame[0], selectedFrame.at(-1)];
            console.log(bucketsFromTo);
            this.props.setCurrentTimeBucketSelectionTuple(bucketsFromTo);
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

        const selection0 = this.props.currentTimeBucketSelectionTuple[0];
        const selection1 = this.props.currentTimeBucketSelectionTuple[1];

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
                            init: "[calcXScale0,calcXScale1]",
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
                                    update: "clampRange([anchor[0] + delta, anchor[1] + delta], 0+1, width-1)"
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
                                    update: "span(brush) ? invert('xscale', brush) : null"
                                }
                            ]
                        },
                        {
                            name: "detailDomainRelease",
                            push: "outer",
                            on: [
                                {
                                    events: "window:mouseup",
                                    update: "detailDomain"
                                }
                            ]
                        },
                        {
                            name: "calcXScale0",
                            init: "scale('xscale'," + selection0 + ")"
                        },
                        {
                            name: "calcXScale1",
                            init: "scale('xscale'," + selection1 + ")"
                        },
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
                            /* title: model.chartConfiguration.activityHistogramXTitle,
                            titleY: -5,
                            titleX: { signal: 'width' },
                            titleAlign: "left",
                            titleFontSize: model.chartConfiguration.axisTitleFontSize,
                            titleFont: model.chartConfiguration.axisTitleFont, */
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
                                        { test: "detailDomain", value: 1 },
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
                                        { test: "detailDomain", value: 1 },
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
