import * as model from '../../../model';
import * as Context from '../../../app_context';
import React from 'react';
import { connect } from 'react-redux';
import { Vega, View } from 'react-vega';
import { VisualizationSpec } from "react-vega/src";
import _ from 'lodash';

interface AppstateProps {
    appContext: Context.IAppContext;
    currentEvent: string;
    operators: model.IOperatorsData | undefined;
    currentInterpolation: String,
    currentBucketSize: number,
    chartData: model.ISwimlanesData,
}

interface State {
    maxYDomainAbsoluteValues: number,
    currentDomainAbsoluteValues: number,
}

type Props = model.ISwimlanesProps & AppstateProps;

class SwimLanesMultiplePipelines extends React.Component<Props, State> {

    constructor(props: Props) {
        super(props);
        this.state = {
            maxYDomainAbsoluteValues: 0,
            currentDomainAbsoluteValues: 0,
        };

        this.createVisualizationSpec = this.createVisualizationSpec.bind(this);
        this.handleVegaView = this.handleVegaView.bind(this);
    }


    componentDidUpdate(prevProps: Props, prevState: State): void {
        console.log("here")
        this.resetMaxAndCurrentAbsoluteYDomain(this.props, prevProps);
    }

    public render() {
        return <Vega className={`vegaSwimlaneMultiplePipelines}`} spec={this.createVisualizationSpec()} onNewView={this.handleVegaView} />
    }

    handleVegaView(view: View) {
        //to figure out max y axis domain of absolute chart, get stacked data from vega and find out max
        if (this.props.absoluteValues) {
            const viewData = view.data("table");
            const dataY1Array = viewData.map(datum => datum.y1);
            const maxY1Value = Math.max(...dataY1Array);
            this.setMaxAndCurrentAbsoluteYDomain(maxY1Value);
        }
    }

    setMaxAndCurrentAbsoluteYDomain(currentMaxFreqStacked: number) {
        if (0 === this.state.maxYDomainAbsoluteValues || currentMaxFreqStacked > this.state.maxYDomainAbsoluteValues) {
            this.setState((state, props) => ({
                ...state,
                maxYDomainAbsoluteValues: currentMaxFreqStacked,
            }));
        } else {
            this.setState((state, props) => ({
                ...state,
                currentDomainAbsoluteValues: currentMaxFreqStacked,
            }));
        }
    }

    resetMaxAndCurrentAbsoluteYDomain(props: Props, prevProps: Props) {
        //reset max y domain for absolute chart on event and bucketsize change
        if (props.currentEvent !== prevProps.currentEvent || props.currentBucketSize !== prevProps.currentBucketSize) {
            this.setState((state, props) => ({
                ...state,
                maxYDomainAbsoluteValues: 0,
            }));
        }
    }


    createVisualizationData() {

        const chartDataElement: model.ISwimlanesData = {
            buckets: this.props.chartData.buckets,
            operatorsNice: this.props.chartData.operatorsNice,
            operators: this.props.chartData.operators,
            frequency: this.props.chartData.frequency,
        }

        const data = {
            name: "table",
            values: chartDataElement,
            transform: [
                {
                    type: "flatten",
                    fields: ["buckets", "operatorsNice", "operators", "frequency"]
                },
                {
                    type: "collect",
                    sort: { field: "operators" }
                },
                {
                    type: "stack",
                    groupby: ["buckets"],
                    field: "frequency"
                }
            ]
        };

        return { data: data, chartDataElement: chartDataElement };

    }

    createVisualizationSpec() {
        const visData = this.createVisualizationData();

        console.log("render spec");
        // const xTicks = () => {

        //     const bucketsUnique = _.uniq(visData.chartDataElement.buckets);
        //     const bucketsUniqueLength = bucketsUnique.length;
        //     console.log(bucketsUnique);
        //     console.log(bucketsUniqueLength);

        //     const numberOfTicks = model.chartConfiguration.isLargeSwimLane(this.props.width) ? 50 : 20;

        //     if (bucketsUniqueLength > numberOfTicks) {
        //         let ticks = [];
        //         let delta = Math.floor(bucketsUniqueLength / numberOfTicks) + 1;
        //         delta = (numberOfTicks % 2 === 0 && delta > 2) ? --delta : delta;
        //         for (let i = 0; i < bucketsUniqueLength; i = i + delta) {
        //             console.log(i);
        //             ticks.push(bucketsUnique[i]);
        //         }
        //         console.log(ticks);
        //         return ticks;
        //     }

        // };

        const spec: VisualizationSpec = {
            $schema: "https://vega.github.io/schema/vega/v5.json",
            width: this.props.width - 55,
            height: this.props.height - 10,
            padding: { left: 5, right: 5, top: 5, bottom: 5 },
            autosize: { type: "fit", resize: false },

            title: {
                text: 'Swim Lanes (variable Pipelines)',
                align: model.chartConfiguration.titleAlign,
                dy: model.chartConfiguration.titlePadding,
                fontSize: model.chartConfiguration.titleFontSize,
                font: model.chartConfiguration.titleFont
            },

            data: [
                visData.data
            ],

            signals: [
                {
                    name: "getMaxY1Absolute",
                    value: 10
                }

            ],

            scales: [
                {
                    name: "x",
                    type: "point",
                    range: "width",
                    domain: {
                        data: "table",
                        field: "buckets"
                    }
                },
                {
                    name: "y",
                    type: "linear",
                    range: "height",
                    nice: true,
                    zero: true,
                    domain: this.props.absoluteValues ? [0, this.state.maxYDomainAbsoluteValues] : [0, 1]
                },
                {
                    name: "color",
                    type: "ordinal",
                    range: model.chartConfiguration.colorScale!.operatorsIdColorScale,
                    domain: this.props.operators!.operatorsId,
                },
                {
                    name: "colorOperatorsGroup",
                    type: "ordinal",
                    domain: this.props.operators!.operatorsGroup,
                    range: model.chartConfiguration.colorScale!.operatorsGroupScale,
                }
            ],
            axes: [
                {
                    orient: "bottom",
                    scale: "x",
                    zindex: 1,
                    labelOverlap: true,
                    values: model.chartConfiguration.getSwimLanesXTicks(visData.chartDataElement.buckets, 50, 20, this.props.width),
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
                    title: this.props.absoluteValues ? model.chartConfiguration.areaChartYTitleAbsolute : model.chartConfiguration.areaChartYTitle,
                    titlePadding: model.chartConfiguration.axisPadding,
                    labelFontSize: model.chartConfiguration.axisLabelFontSize,
                    labelSeparation: model.chartConfiguration.areaChartYLabelSeparation,
                    labelOverlap: true,
                    titleFontSize: model.chartConfiguration.axisTitleFontSize,
                    titleFont: model.chartConfiguration.axisTitleFont,
                    labelFont: model.chartConfiguration.axisLabelFont,
                }
            ],
            marks: [
                {
                    type: "group",
                    from: {
                        facet: {
                            name: "series",
                            data: "table",
                            groupby: "operators"
                        }
                    },
                    marks: [
                        {
                            type: "area",
                            from: {
                                data: "series"
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
                                        scale: "color",
                                        field: "operators"
                                    },
                                    tooltip:
                                    {
                                        signal: `{${this.props.absoluteValues ? model.chartConfiguration.areaChartAbsoluteTooltip : model.chartConfiguration.areaChartTooltip}}`,
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
                }
            ],
            legends: [{
                fill: "colorOperatorsGroup",
                title: "Operators",
                orient: "right",
                labelFontSize: model.chartConfiguration.legendLabelFontSize,
                titleFontSize: model.chartConfiguration.legendTitleFontSize,
                symbolSize: model.chartConfiguration.legendSymbolSize,
                values: [...new Set(this.props.operators!.operatorsGroup)],
            }
            ],
        } as VisualizationSpec;

        return spec;
    }

}

const mapStateToProps = (state: model.AppState, ownProps: model.ISwimlanesProps) => ({
    currentEvent: state.currentEvent,
    operators: state.operators,
    currentInterpolation: state.currentInterpolation,
    currentBucketSize: state.currentBucketSize,
    chartData: state.chartData[ownProps.chartId].chartData.data as model.ISwimlanesData,
});


export default connect(mapStateToProps, undefined)(Context.withAppContext(SwimLanesMultiplePipelines));
