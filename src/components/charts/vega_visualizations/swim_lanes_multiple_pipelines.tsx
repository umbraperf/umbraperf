import * as model from '../../../model';
import * as Context from '../../../app_context';
import React from 'react';
import { connect } from 'react-redux';
import { Vega, View} from 'react-vega';
import { VisualizationSpec } from "react-vega/src";
import _ from 'lodash';


interface AppstateProps {
    appContext: Context.IAppContext;
    currentEvent: string;
    operators: Array<string> | undefined;
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
            operators: this.props.chartData.operators,
            frequency: this.props.chartData.frequency,
        }

        const data = {
            name: "table",
            values: chartDataElement,
            transform: [
                { "type": "flatten", "fields": ["buckets", "operators", "frequency"] },
                { "type": "collect", "sort": { "field": "operators" } },
                { "type": "stack", "groupby": ["buckets"], "field": "frequency" }
            ]
        };

        return { data: data, chartDataElement: chartDataElement };

    }

    createVisualizationSpec() {
        const visData = this.createVisualizationData();

        const xTicks = () => {

            const bucketsArrayLength = visData.chartDataElement.buckets.length;
            const numberOfTicks = 20;

            if (bucketsArrayLength > numberOfTicks) {

                let ticks = [];

                const delta = Math.floor(bucketsArrayLength / numberOfTicks);

                for (let i = 0; i < bucketsArrayLength; i = i + delta) {
                    ticks.push(visData.chartDataElement.buckets[i]);
                }
                return ticks;
            }

        };

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
                    range: model.chartConfiguration.getOperatorColorScheme(this.props.operators!.length),
                    domain: this.props.operators,
                }
            ],
            axes: [
                {
                    orient: "bottom",
                    scale: "x",
                    zindex: 1,
                    labelOverlap: true,
                    values: xTicks(),
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
                fill: "color",
                title: "Operators",
                orient: "right",
                labelFontSize: model.chartConfiguration.legendLabelFontSize,
                titleFontSize: model.chartConfiguration.legendTitleFontSize,
                symbolSize: model.chartConfiguration.legendSymbolSize,
                values: this.props.operators,
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
