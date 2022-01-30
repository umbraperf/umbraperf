import * as model from '../../../model';
import * as Context from '../../../app_context';
import * as Controller from '../../../controller';
import React from 'react';
import { connect } from 'react-redux';
import { SignalListeners, Vega } from 'react-vega';
import { VisualizationSpec } from "react-vega/src";
import _ from 'lodash';


interface AppstateProps {
    appContext: Context.IAppContext;
    operators: model.IOperatorsData | undefined;
    currentOperator: Array<string> | "All",
    chartData: model.IBarChartData;
}

type Props = model.IBarChartProps & AppstateProps;


class BarChart extends React.Component<Props, {}> {

    constructor(props: Props) {
        super(props);

        this.createVisualizationSpec = this.createVisualizationSpec.bind(this);
        this.handleClickOperator = this.handleClickOperator.bind(this);
    }


    public render() {
        return <Vega spec={this.createVisualizationSpec()} signalListeners={this.createVegaSignalListeners()} />
    }

    createVegaSignalListeners() {
        const signalListeners: SignalListeners = {
            clickOperator: this.handleClickOperator,
        }
        return signalListeners;
    }

    handleClickOperator(...args: any[]) {
        if (args[1]) {
            Controller.handleOperatorSelection(args[1]);
        }
    }

    createVisualizationData() {

        const operatorsArray = this.props.chartData.operators;
        const valueArray = this.props.chartData.frequency;

        const data = [
            {
                name: "operatorsNiceMapping",
                values: { operatorsId: this.props.operators!.operatorsId, operatorsNice: this.props.operators!.operatorsNice },
                transform: [
                    {
                        type: "flatten",
                        fields: ["operatorsId", "operatorsNice"]
                    }
                ],
            },
            {
                name: "table",
                values: [
                    { operators: operatorsArray, values: valueArray }
                ],
                transform: [
                    {
                        type: "flatten",
                        fields: ["operators", "values"]
                    },
                    {
                        type: "lookup",
                        from: "operatorsNiceMapping",
                        key: "operatorsId",
                        fields: ["operators"],
                        values: ["operatorsNice"],
                    }
                ],
            },
            {
                name: "selectedOperators",
                values: { operatorsUsed: this.props.currentOperator === "All" ? this.props.operators!.operatorsId : this.props.currentOperator },
                transform: [
                    {
                        type: "flatten",
                        fields: ["operatorsUsed"]
                    }
                ]
            },
        ];


        return data;
    }

    createVisualizationSpec() {
        const visData = this.createVisualizationData();

        const hideAllBarValues = () => {
            if (this.props.operators!.operatorsId.length >= 20) {
                return true;
            }
            if (this.props.operators!.operatorsId.length >= 15 && this.props.width < 500) {
                return true;
            }
            if (this.props.operators!.operatorsId.length >= 10 && this.props.width < 420) {
                return true;
            }
            return false;
        }

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

            signals: [
                {
                    name: "hoverBarDatum",
                    value: {},
                    on: [
                        { events: "rect:mouseover", update: "datum" },
                        { events: "rect:mouseout", update: "{}" }
                    ]
                },
                {
                    name: "clickOperator",
                    on: [
                        { events: { marktype: "rect", type: "click" }, update: "datum.operators" }
                    ]
                },
            ],

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
                    range: model.chartConfiguration.colorScale!.operatorsIdColorScale,
                    domain: this.props.operators!.operatorsId,
                },
                {
                    name: "colorDisabled",
                    type: "ordinal",
                    range: model.chartConfiguration.colorScale!.operatorsIdColorScaleLowOpacity,
                    domain: this.props.operators!.operatorsId,
                },
            ],

            axes: [
                {
                    orient: 'bottom',
                    scale: 'xscale',
                    labelOverlap: true,
                    labelSeparation: model.chartConfiguration.barChartXLabelSeparation,
                    title: "Operators",
                    titleY: model.chartConfiguration.barChartXTitleY,
                    titleX: { signal: 'width', mult: model.chartConfiguration.barChartXTitleXOffsetMult },
                    titleAlign: "left",
                    titleFontSize: model.chartConfiguration.axisTitleFontSize,
                    titleFont: model.chartConfiguration.axisTitleFont,
                    labelFontSize: model.chartConfiguration.axisLabelFontSize,
                    labelFont: model.chartConfiguration.axisLabelFont,
                    labelAngle: model.chartConfiguration.barChartXLabelAngle,
                    encode: {
                        labels: {
                            update: {
                                text: { signal: "truncate(datum.value, 11)" },
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
                                { scale: "colorDisabled", field: "operators" },
                            ],
                            fillOpacity: {
                                value: 1,
                            },
                        },
                        hover: {
                            fillOpacity: {
                                value: model.chartConfiguration.hoverFillOpacity,
                            },
                            cursor: { value: "pointer" }
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
                            fontSize: { value: model.chartConfiguration.barChartValueLabelFontSize },
                            font: model.chartConfiguration.valueLabelFont,

                        },
                        update: {
                            //if all bar values hidden because of small representation or too many operators, show value of hovered bar and empty string as value for all other bars
                            text: hideAllBarValues() ?
                                { signal: "hoverBarDatum.operators===datum.datum.operators ? hoverBarDatum.values : ''" } :
                                { signal: "datum.datum.values" },
                        },
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
