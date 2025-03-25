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
    chartData: model.ISwimlanesTmamData,
}

type Props = model.ISwimlanesProps & AppstateProps;

interface State {
    currentAbsoluteYDomainValue: number;
}

class SwimLanesTmam extends React.Component<Props, State> {

    constructor(props: Props) {
        super(props);

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

        const chartDataElement: model.ISwimlanesTmamData = {
            buckets: this.props.chartData.buckets,
            category: this.props.chartData.category,
            frequency: this.props.chartData.frequency,
        }

        const data = {
            name: "table",
            values: chartDataElement,
            transform: [
                {
                    type: "flatten",
                    fields: ["buckets", "category", "frequency"]
                },
                {
                    type: "collect",
                    sort: { field: "category" }
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

        const spec: VisualizationSpec = {
            $schema: "https://vega.github.io/schema/vega/v5.json",
            width: this.props.width - 55,
            height: this.props.height - 10,
            padding: { left: 5, right: 5, top: 5, bottom: 5 },
            autosize: { type: "fit", resize: false },

            title: {
                text: 'Swim Lanes (TMAM)',
                align: model.chartConfiguration.titleAlign,
                dy: model.chartConfiguration.titlePadding,
                fontSize: model.chartConfiguration.titleFontSize,
                font: model.chartConfiguration.titleFont
            },

            data: [
                visData.data
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
                    domain: [0, 1]
                },
                {
                    name: "color",
                    type: "ordinal",
                    range: model.chartConfiguration.colorScale!.operatorsGroupScale,
                    domain: this.props.chartData.category,
                },
            ],
            axes: [
                {
                    orient: "bottom",
                    scale: "x",
                    zindex: 1,
                    labelOverlap: true,
                    values: model.chartConfiguration.getSwimLanesXTicks(visData.chartDataElement.buckets, 50, 20, this.props.width),
                    format: ".0f",
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
                    title: model.chartConfiguration.areaChartYTitle,
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
                            groupby: "category"
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
                                        field: "category"
                                    },
                                    tooltip:
                                    {
                                        signal: `{${model.chartConfiguration.areaChartTmumTooltip}}`,
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
                fill: "color",
                title: "Cathegories",
                orient: "right",
                labelFontSize: model.chartConfiguration.legendLabelFontSize,
                titleFontSize: model.chartConfiguration.legendTitleFontSize,
                symbolSize: model.chartConfiguration.legendSymbolSize,
                values: [...new Set(this.props.chartData.category)],
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
    chartData: state.chartData[ownProps.chartId].chartData.data as model.ISwimlanesData,
});


export default connect(mapStateToProps, undefined)(Context.withAppContext(SwimLanesTmam));
