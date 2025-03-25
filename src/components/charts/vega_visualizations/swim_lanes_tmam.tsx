import * as model from '../../../model';
import * as Controller from '../../../controller';
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
    currentAbsoluteSwimLaneMaxYDomain: number,
}

type Props = model.ISwimlanesProps & AppstateProps;

interface State {
    currentAbsoluteYDomainValue: number;
}

class SwimLanesTmam extends React.Component<Props, State> {

    constructor(props: Props) {
        super(props);
        this.state = {
            currentAbsoluteYDomainValue: 0,
        };

        this.createVisualizationSpec = this.createVisualizationSpec.bind(this);
        this.handleVegaView = this.handleVegaView.bind(this);
    }


    public render() {
        return <Vega
            className={`vegaSwimlaneTmam}`}
            spec={this.createVisualizationSpec()}
            onNewView={this.handleVegaView}
        />
    }

    handleVegaView(view: View) {
        //to figure out max y axis domain of absolute chart, get stacked data from vega and find out max, set max to global state to keep for remountings eg. on event change
        if (this.props.absoluteValues) {
            const viewData = view.data("table");
            const dataY1Array = viewData.map(datum => datum.y1);
            const maxY1Value = Math.max(...dataY1Array);
            this.setState((state, props) => ({
                ...state,
                currentAbsoluteYDomainValue: maxY1Value,
            }));
            Controller.setCurrentAbsoluteSwimLaneMaxYDomain(maxY1Value);
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

        const getAbsoluteYDomain = () => {
            //use current plus percentage of difference to max if smaller then half of max, else use max
            const differenceCurrentMaxYDomain = this.props.currentAbsoluteSwimLaneMaxYDomain - this.state.currentAbsoluteYDomainValue;
            if (differenceCurrentMaxYDomain > this.props.currentAbsoluteSwimLaneMaxYDomain / 2) {
                const differencePercentage = 70;
                return this.state.currentAbsoluteYDomainValue + ((differenceCurrentMaxYDomain * differencePercentage) / 100);
            } else {
                return this.props.currentAbsoluteSwimLaneMaxYDomain;
            }
        }

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
                    domain: this.props.absoluteValues ? [0, getAbsoluteYDomain()] : [0, 1]
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
                values: [...new Set(this.props.operators!.operatorsGroupSorted)],
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
    currentAbsoluteSwimLaneMaxYDomain: state.currentAbsoluteSwimLaneMaxYDomain,
});


export default connect(mapStateToProps, undefined)(Context.withAppContext(SwimLanesTmam));
