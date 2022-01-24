import * as model from '../../../model';
import * as Context from '../../../app_context';
import React from 'react';
import { connect } from 'react-redux';
import { Vega } from 'react-vega';
import { VisualizationSpec } from "react-vega/src";
import _ from 'lodash';


interface AppstateProps {
    appContext: Context.IAppContext;
    currentMultipleEvent: [string, string] | "Default";
    operators: model.IOperatorsData | undefined;
    currentInterpolation: String,
    chartData: model.ISwimlanesCombinedData,
}

type Props = AppstateProps & model.ISwimlanesProps;


class SwimLanesCombinedMultiplePipelines extends React.Component<Props, {}> {

    constructor(props: Props) {
        super(props);

        this.createVisualizationSpec = this.createVisualizationSpec.bind(this);
    }

    public render() {
        return <Vega className={`vegaSwimlaneMultiplePipelines}`} spec={this.createVisualizationSpec()} />
    }

    createVisualizationData() {

        const chartDataElementPos: model.ISwimlanesData = {
            buckets: this.props.chartData.buckets,
            operatorsNice: this.props.chartData.operatorsNice,
            operators: this.props.chartData.operators,
            frequency: this.props.chartData.frequency,
        }

        const chartDataElementNeg: model.ISwimlanesData = {
            buckets: this.props.chartData.bucketsNeg,
            operatorsNice: this.props.chartData.operatorsNiceNeg,
            operators: this.props.chartData.operatorsNeg,
            frequency: this.props.chartData.frequencyNeg,
        }

        const data = [{
            name: "tablePos",
            values: chartDataElementPos,
            transform: [
                { type: "flatten", fields: ["buckets", "operators", "frequency", "operatorsNice"] },
                { type: "collect", sort: { "field": "operators" } },
                { type: "stack", groupby: ["buckets"], field: "frequency" }
            ]
        },
        {
            name: "tableNeg",
            values: chartDataElementNeg,
            transform: [
                { type: "flatten", fields: ["buckets", "operators", "frequency", "operatorsNice"] },
                { type: "collect", sort: { "field": "operators" } },
                { type: "stack", groupby: ["buckets"], field: "frequency" }
            ]
        }
        ];

        const mergedBucketsPosNeg = _.sortBy((_.uniq(_.union(chartDataElementPos.buckets, chartDataElementNeg.buckets))).filter(elem => elem >= 0));

        return { data: data, mergedBucketsPosNeg: mergedBucketsPosNeg };
    }

    createVisualizationSpec() {
        const visData = this.createVisualizationData();

        // const xTicks = () => {

        //     const numberOfTicks = model.chartConfiguration.isLargeSwimLane(this.props.width) ? 60 : 30;
        //     const mergedBucketsPosNegLength = visData.mergedBucketsPosNeg.length;

        //     if (mergedBucketsPosNegLength > numberOfTicks) {
        //         let ticks = [];
        //         const delta = Math.floor(mergedBucketsPosNegLength / numberOfTicks) + 1;
        //         for (let i = 0; i < mergedBucketsPosNegLength; i = i + delta) {
        //             ticks.push(visData.mergedBucketsPosNeg[i]);
        //         }
        //         return ticks;
        //     }

        // }

        const spec: VisualizationSpec = {
            $schema: "https://vega.github.io/schema/vega/v5.json",
            width: this.props.width - 60,
            height: this.props.height - 10,
            padding: { left: 5, right: 5, top: 5, bottom: 5 },
            autosize: { type: "fit", resize: false },

            title: {
                text: `Swim Lanes for multiple Events (variable Pipelines) with ${this.props.absoluteValues ? "Absolute" : "Relative"} Frequencies`,
                align: model.chartConfiguration.titleAlign,
                dy: model.chartConfiguration.titlePadding,
                fontSize: model.chartConfiguration.titleFontSize,
                font: model.chartConfiguration.titleFont
            },

            data: visData.data,

            scales: [
                {
                    name: "x",
                    type: "point",
                    range: "width",
                    domain: visData.mergedBucketsPosNeg,
                },
                {
                    name: "y",
                    type: "linear",
                    range: [{ signal: "(height/2) - 4" }, 0],
                    nice: true,
                    zero: true,
                    domain: {
                        fields: [
                            { data: "tablePos", field: "y1" },
                        ]
                    }
                },
                {
                    name: "yNeg",
                    type: "linear",
                    range: [{ signal: "height" }, { signal: "(height/2) + 4" }],
                    nice: true,
                    zero: true,
                    reverse: true, //down counting values
                    domain: {
                        fields: [
                            { data: "tableNeg", field: "y1" }
                        ]
                    }
                },
                {
                    name: "colorPos",
                    type: "ordinal",
                    range: model.chartConfiguration.colorScale!.operatorsIdColorScale,
                    domain: this.props.operators!.operatorsId,
                },
                {
                    name: "colorNeg",
                    type: "ordinal",
                    range: model.chartConfiguration.colorScale!.operatorsIdColorScale,
                    domain: this.props.operators!.operatorsId,
                },
                {
                    name: "colorOperatorsGroup",
                    type: "ordinal",
                    domain: this.props.operators!.operatorsGroupSorted,
                    range: model.chartConfiguration.colorScale!.operatorsGroupScale,
                }
            ],

            axes: [
                {
                    orient: "bottom",
                    scale: "x",
                    zindex: 1,
                    labelOverlap: true,
                    values: model.chartConfiguration.getSwimLanesXTicks(visData.mergedBucketsPosNeg, 60, 30, this.props.width),
                    title: model.chartConfiguration.areaChartXTitle,
                    titlePadding: model.chartConfiguration.axisPadding,
                    labelFontSize: model.chartConfiguration.axisLabelFontSize,
                    titleFontSize: model.chartConfiguration.axisTitleFontSize,
                    titleFont: model.chartConfiguration.axisTitleFont,
                    labelFont: model.chartConfiguration.axisLabelFont,
                    labelSeparation: model.chartConfiguration.areaChartXLabelSeparation,
                },
                {
                    orient: "left",
                    scale: "y",
                    zindex: 1,
                    title: { signal: `truncate("${this.props.currentMultipleEvent[0]}", 15)` },
                    titlePadding: model.chartConfiguration.axisPadding,
                    labelFontSize: model.chartConfiguration.axisLabelFontSize,
                    labelSeparation: model.chartConfiguration.areaChartYLabelSeparation,
                    labelOverlap: true,
                    titleFontSize: model.chartConfiguration.axisTitleFontSizeYCombined,
                    titleFont: model.chartConfiguration.axisTitleFont,
                    labelFont: model.chartConfiguration.axisLabelFont,
                },
                {
                    orient: "left",
                    scale: "yNeg",
                    zindex: 1,
                    title: { signal: `truncate("${this.props.currentMultipleEvent[1]}", 15)` },
                    titlePadding: model.chartConfiguration.axisPadding,
                    labelFontSize: model.chartConfiguration.axisLabelFontSize,
                    labelSeparation: model.chartConfiguration.areaChartYLabelSeparation,
                    labelOverlap: true,
                    titleFontSize: model.chartConfiguration.axisTitleFontSizeYCombined,
                    titleFont: model.chartConfiguration.axisTitleFont,
                    labelFont: model.chartConfiguration.axisLabelFont,
                }
            ],
            marks: [
                {
                    type: "group",
                    from: {
                        facet: {
                            name: "seriesPos",
                            data: "tablePos",
                            groupby: "operators"
                        }
                    },
                    marks: [
                        {
                            type: "area",
                            from: {
                                data: "seriesPos"
                            },
                            encode: {
                                enter: {
                                    interpolate: {
                                        value: this.props.currentInterpolation as string,
                                    },
                                    x: {
                                        scale: "x",
                                        field: "buckets"
                                    },
                                    y: {
                                        scale: "y",
                                        field: "y0"
                                    },
                                    y2: {
                                        scale: "y",
                                        field: "y1"
                                    },
                                    fill: {
                                        scale: "colorPos",
                                        field: "operators"
                                    },
                                    tooltip: {
                                        signal: `{'Event': '${this.props.currentMultipleEvent[0]}', ${this.props.absoluteValues ? model.chartConfiguration.areaChartAbsoluteTooltip : model.chartConfiguration.areaChartTooltip}}`,
                                    },

                                },
                                update: {
                                    fillOpacity: {
                                        value: 1
                                    }
                                },
                                hover: {
                                    fillOpacity: {
                                        value: model.chartConfiguration.hoverFillOpacity,
                                    },
                                }
                            }
                        }
                    ]
                },
                {
                    name: "backgroundNeg",
                    type: "rect",
                    encode: {
                        enter: {
                            x: { value: 0 },
                            x2: { signal: "width" },
                            y: { signal: "height/2" },
                            y2: { signal: "height" },
                            fill: { value: "#f0f0f0" },
                            opacity: { value: 0.5 },
                            zindex: 0,
                        }
                    }
                },
                {
                    type: "group",
                    from: {
                        facet: {
                            name: "seriesNeg",
                            data: "tableNeg",
                            groupby: "operators"
                        }
                    },
                    marks: [
                        {
                            type: "area",
                            from: {
                                data: "seriesNeg"
                            },
                            encode: {
                                enter: {
                                    interpolate: {
                                        value: this.props.currentInterpolation as string,
                                    },
                                    x: {
                                        scale: "x",
                                        field: "buckets"
                                    },
                                    y: {
                                        scale: "yNeg",
                                        field: "y0"
                                    },
                                    y2: {
                                        scale: "yNeg",
                                        field: "y1"
                                    },
                                    fill: {
                                        scale: "colorNeg",
                                        field: "operators"
                                    },
                                    tooltip: {
                                        signal: `{'Event': '${this.props.currentMultipleEvent[1]}', ${this.props.absoluteValues ? model.chartConfiguration.areaChartAbsoluteTooltip : model.chartConfiguration.areaChartTooltip}}`,
                                    },

                                },
                                update: {
                                    fillOpacity: {
                                        value: 1
                                    }
                                },
                                hover: {
                                    fillOpacity: {
                                        value: 0.5
                                    }
                                }
                            }
                        }
                    ]
                }
            ],
            legends: [{
                fill: "colorOperatorsGroup",
                title: "Operators",
                orient: "right",
                labelFontSize: model.chartConfiguration.legendLabelFontSize,
                titleFontSize: model.chartConfiguration.legendTitleFontSize,
                symbolSize: model.chartConfiguration.legendSymbolSize,
                values: [...new Set(this.props.operators!.operatorsGroupSorted)],
            }
            ],
        } as VisualizationSpec;

        return spec;
    }

}

const mapStateToProps = (state: model.AppState, ownProps: model.ISwimlanesProps) => ({
    currentMultipleEvent: state.currentMultipleEvent,
    operators: state.operators,
    currentInterpolation: state.currentInterpolation,
    chartData: state.chartData[ownProps.chartId].chartData.data as model.ISwimlanesCombinedData,
});


export default connect(mapStateToProps, undefined)(Context.withAppContext(SwimLanesCombinedMultiplePipelines));
