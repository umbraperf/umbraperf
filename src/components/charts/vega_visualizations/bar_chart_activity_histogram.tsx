import * as model from '../../../model';
import * as Controller from '../../../controller';
import * as Context from '../../../app_context';
import React from 'react';
import { connect } from 'react-redux';
import { SignalListeners, Vega } from 'react-vega';
import { VisualizationSpec } from "react-vega/src";
import _ from 'lodash';


interface AppstateProps {
    appContext: Context.IAppContext;
    chartData: model.IBarChartActivityHistogramData,
    currentTimeBucketSelectionTuple: [number, number];
    currentTimePositionSelectionTuple: [number, number];
}

type Props = model.IBarChartActivityHistogramProps & AppstateProps;


class BarChartActivityHistogram extends React.Component<Props, {}> {


    constructor(props: Props) {
        super(props);

        this.createVisualizationSpec = this.createVisualizationSpec.bind(this);
        this.handleDetailDomainSelection = this.handleDetailDomainSelection.bind(this);
    }

    public render() {

        return <div style={{ position: "relative" }} >
            {Controller.createChartResetComponent('timeselection')}
            <Vega spec={this.createVisualizationSpec()} signalListeners={this.createVegaSignalListeners()} />
        </div>

    }

    createVegaSignalListeners() {
        const signalListeners: SignalListeners = {
            detailDomainRelease: this.handleDetailDomainSelection,
        }
        return signalListeners;
    }

    handleDetailDomainSelection(...args: any[]) {
        if (null === args[1] || null === args[1][0] || null === args[0][1]) {
            Controller.resetSelectionTimeframe();
        }
        else if (args[1] && args[1][0] && args[1][1]) {
            const selectedTimeBuckets = args[1][0];
            const selectedPosition = args[1][1]
            const timeBucketsFromTo: [number, number] = [selectedTimeBuckets[0], selectedTimeBuckets.at(-1)];
            const positionFromTo: [number, number] = [selectedPosition[0], selectedPosition.at(-1)];
            Controller.handleTimeBucketSelection(timeBucketsFromTo, positionFromTo);
        }
    }

    createVisualizationData() {

        const timeBucketsArray = this.props.chartData.buckets;
        const occurrencesArray = this.props.chartData.occurrences;

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
            width: this.props.width - 50,
            height: 70,
            padding: { left: 5, right: 5, top: 5, bottom: 5 },
            autosize: { type: "fit", resize: false },
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
                },
                {
                    name: "cursor",
                    value: "default",
                    on: [
                        { events: [{ type: "mouseover", marktype: "group" }, { type: "mouseover", markname: "bars" }], update: { value: "crosshair" } },
                        { events: { type: "mouseover", markname: "brush" }, update: { value: "move" } },
                        { events: "group:mouseout", update: { value: "default" } }
                    ]
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
                            position: 10,
                            labelOverlap: true,
                            title: model.chartConfiguration.activityHistogramXTitle,
                            titleY: -5,
                            titleX: { signal: 'width', mult: 1.01 },
                            titleAlign: "left",
                            titleFontSize: model.chartConfiguration.axisTitleFontSize,
                            titleFont: model.chartConfiguration.axisTitleFont,
                            values: xTicks(),
                            labelSeparation: model.chartConfiguration.activityHistogramXLabelSeparation,
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
                                    fill: { value: this.props.appContext.accentBlack },
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

const mapStateToProps = (state: model.AppState, ownProps: model.IBarChartActivityHistogramProps) => ({
    currentTimeBucketSelectionTuple: state.currentTimeBucketSelectionTuple,
    currentTimePositionSelectionTuple: state.currentTimePositionSelectionTuple,
    chartData: state.chartData[ownProps.chartId].chartData.data as model.IBarChartActivityHistogramData,
});



export default connect(mapStateToProps, undefined)(Context.withAppContext(BarChartActivityHistogram));
