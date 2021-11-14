import * as model from '../../../model';
import * as Context from '../../../app_context';
import React from 'react';
import { connect } from 'react-redux';
import { Vega } from 'react-vega';
import { VisualizationSpec } from "react-vega/src";
import _ from 'lodash';


interface AppstateProps {
    appContext: Context.IAppContext;
    operators: Array<string> | undefined;
    currentOperator: Array<string> | "All",
    chartData: model.IBarChartData;
}

type Props = model.IBarChartProps & AppstateProps;


const startSize = {
    width: 500,
    height: window.innerHeight > 1000 ? 500 : window.innerHeight - 300,
}

class BarChart extends React.Component<Props, {}> {

    constructor(props: Props) {
        super(props);

        this.createVisualizationSpec = this.createVisualizationSpec.bind(this);
    }


    public render() {
        return <Vega spec={this.createVisualizationSpec()} />
    }

    createVisualizationData() {

        const operatorsArray = this.props.chartData.operators;
        const valueArray = this.props.chartData.frequency;

        const data = [
            {
                name: "table",
                values: [
                    { operators: operatorsArray, values: valueArray }
                ],
                transform: [{ type: "flatten", fields: ["operators", "values"] }],
            },
            {
                name: "selectedOperators",
                values: { operatorsUsed: this.props.currentOperator === "All" ? this.props.operators : this.props.currentOperator },
                transform: [
                    {
                        type: "flatten",
                        fields: ["operatorsUsed"]
                    }
                ]
            }
        ];


        return data;
    }

    createVisualizationSpec() {
        const visData = this.createVisualizationData();

        const spec: VisualizationSpec = {
            $schema: 'https://vega.github.io/schema/vega/v5.json',
            width: this.props.width - 50,
            height: this.props.height - 10,
            padding: { left: 5, right: 5, top: 5, bottom: 5 },
            resize: false,
            autosize: 'fit',
            title: {
                text: "Absolute Occurence of Operators per Event",
                align: model.chartConfiguration.titleAlign,
                dy: model.chartConfiguration.titlePadding,
                fontSize: model.chartConfiguration.titleFontSize,
                font: model.chartConfiguration.titleFont
            },

            data: visData,

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
                {
                    name: "color",
                    type: "ordinal",
                    range: model.chartConfiguration.getOperatorColorScheme(this.props.operators!.length),
                    domain: this.props.operators,
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
                            tooltip: {
                                signal: model.chartConfiguration.barChartTooltip,
                            }
                        },
                        update: {
                            fill: [
                                { test: "indata('selectedOperators', 'operatorsUsed', datum.operators)", scale: "color", field: "operators" },
                                { value: this.props.appContext.tertiaryColor },
                            ],
                            fillOpacity: {
                                value: 1,
                            },
                        },
                        hover: {
                            fillOpacity: {
                                value: model.chartConfiguration.hoverFillOpacity,
                            },
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
                            fill: { value: "black" },
                            align: { value: "center" },
                            baseline: { value: "middle" },
                            text: { field: "datum.values" },
                            fontSize: { value: model.chartConfiguration.barChartValueLabelFontSize },
                            font: model.chartConfiguration.valueLabelFont,
                        }
                    }
                },
            ],
        } as VisualizationSpec;

        return spec;
    }

}

const mapStateToProps = (state: model.AppState, ownProps: model.IBarChartProps) => ({
    operators: state.operators,
    currentOperator: state.currentOperator,
    chartData: state.chartData[ownProps.chartId].chartData.data as model.IBarChartData,

});


export default connect(mapStateToProps, undefined)(Context.withAppContext(BarChart));
