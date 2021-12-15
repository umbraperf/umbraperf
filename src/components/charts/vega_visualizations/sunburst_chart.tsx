import * as model from '../../../model';
import * as Controller from '../../../controller';
import * as Context from '../../../app_context';
import React from 'react';
import { connect } from 'react-redux';
import { SignalListeners, Vega } from 'react-vega';
import { VisualizationSpec } from "react-vega/src";
import _ from 'lodash';
import ChartResetButton from '../../utils/togglers/chart_reset_button';

//TODO same inactive color as in qp, grey and not clickable if unavailable, visualize pipeline availability

interface AppstateProps {
    appContext: Context.IAppContext;
    currentPipeline: Array<string> | "All";
    currentOperator: Array<string> | "All";
    pipelines: Array<string> | undefined;
    pipelinesShort: Array<string> | undefined;
    operators: model.IOperatorsData | undefined;
    chartData: model.ISunburstChartData,
}

type Props = model.ISunburstChartProps & AppstateProps;

class SunburstChart extends React.Component<Props, {}> {

    constructor(props: Props) {
        super(props);

        this.createVisualizationSpec = this.createVisualizationSpec.bind(this);
        this.handleClickPipeline = this.handleClickPipeline.bind(this);
        this.handleClickOperator = this.handleClickOperator.bind(this);
    }



    public render() {
        return <div style={{ position: "relative" }} >
            {this.createChartResetComponent()}
            <Vega spec={this.createVisualizationSpec()} signalListeners={this.createVegaSignalListeners()} />
        </div>
    }

    createChartResetComponent() {
        return this.isResetButtonVisible() && <ChartResetButton chartResetButtonFunction={Controller.resetSunburstSelection} />;
    }

    isResetButtonVisible() {
        if ((this.props.currentOperator !== "All"
            && !_.isEqual(this.props.currentOperator, this.props.operators!.operatorsId))
            || (this.props.currentPipeline !== "All"
                && !_.isEqual(this.props.currentPipeline, this.props.pipelines))) {
            return true;
        } else {
            return false;
        }
    }

    createVegaSignalListeners() {
        const signalListeners: SignalListeners = {
            clickPipeline: this.handleClickPipeline,
            clickOperator: this.handleClickOperator,
        }
        return signalListeners;
    }

    handleClickPipeline(...args: any[]) {
        if (args[1]) {
            Controller.handlePipelineSelection(args[1]);
        }
    }

    handleClickOperator(...args: any[]) {
        if (args[1]) {
            Controller.handleOperatorSelection(args[1][0], args[1][1]);
        }
    }

    createVisualizationData() {

        const operatorIdArray = this.props.chartData.operator;
        const parentPipelinesArray = this.props.chartData.pipeline;
        const operatorOccurrencesArray = Array.from(this.props.chartData.opOccurrences);
        const pipelineOccurrencesArray = Array.from(this.props.chartData.pipeOccurrences);

        //add datum for inner circle at beginning of data only on first rerender
        operatorIdArray[0] !== "inner" && operatorIdArray.unshift("inner");
        parentPipelinesArray[0] !== null && parentPipelinesArray.unshift(null);
        operatorOccurrencesArray[0] !== null && operatorOccurrencesArray.unshift(null);
        pipelineOccurrencesArray[0] !== null && pipelineOccurrencesArray.unshift(null);

        const data = [
            {
                name: "selectedPipelines",
                values: { pipelinesUsed: this.props.currentPipeline === "All" ? this.props.pipelines : this.props.currentPipeline },
                transform: [
                    {
                        type: "flatten",
                        fields: ["pipelinesUsed"]
                    }
                ]
            },
            {
                name: "pipelinesShort",
                values: { pipeline: this.props.pipelines, pipelineShort: this.props.pipelinesShort },
                transform: [
                    {
                        type: "flatten",
                        fields: ["pipeline", "pipelineShort"]
                    }
                ]
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
            {
                //TODO 
                name: "availableOperatorsTimeframePipeline",

            },
            {
                //TODO 
                name: "availablePipelines"
            },
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
                name: "tree",
                values: [
                    { operator: operatorIdArray, parent: parentPipelinesArray, pipeOccurrences: pipelineOccurrencesArray, opOccurrences: operatorOccurrencesArray }
                ],
                transform: [
                    {
                        type: "flatten",
                        fields: ["operator", "parent", "pipeOccurrences", "opOccurrences"]
                    },
                    {
                        type: "stratify",
                        key: "operator",
                        parentKey: "parent"
                    },
                    {
                        type: "partition",
                        field: "opOccurrences", //size of leaves -> operators
                        sort: { field: "value" },
                        size: [{ signal: "2 * PI" }, { signal: "pieSize" }], //determine size of pipeline circles
                        as: ["a0", "r0", "a1", "r1", "depth", "children"]
                    },
                    {
                        type: "lookup", //join short pipeline names to tree table
                        from: "pipelinesShort",
                        key: "pipeline",
                        fields: ["operator"],
                        values: ["pipelineShort"],
                    },
                    {
                        type: "lookup", //join short parent pipeline names colum 
                        from: "pipelinesShort",
                        key: "pipeline",
                        fields: ["parent"],
                        values: ["pipelineShort"],
                        as: ["parentShort"]
                    },
                    {
                        type: "lookup", //join operator nice names column only at operator rows
                        from: "operatorsNiceMapping",
                        key: "operatorsId",
                        fields: ["operator"],
                        values: ["operatorsNice"],
                    }
                ],

            },
        ];

        return data;
    }

    createVisualizationSpec() {
        const visData = this.createVisualizationData();

        const sunburstSize = () => {
            if (this.props.doubleRowSize) {
                if (this.props.width > 520) {
                    return 120;
                } else if (this.props.width > 450) {
                    return 100;
                } else {
                    return 80;
                }

            } else {
                return 70;
            }
        }

        const pipelinesLegend = () => {
            return this.props.pipelines!.map((elem, index) => (this.props.pipelinesShort![index] + ": " + elem));
        }

        const spec: VisualizationSpec = {
            $schema: "https://vega.github.io/schema/vega/v5.json",
            width: this.props.width - 50,
            height: this.props.height - 10,
            padding: { left: 5, right: 5, top: 5, bottom: 5 },
            autosize: { type: "fit", resize: false },

            title: {
                text: "Shares of Pipelines and Operators",
                align: model.chartConfiguration.titleAlign,
                dy: model.chartConfiguration.titlePadding,
                fontSize: model.chartConfiguration.titleFontSize,
                font: model.chartConfiguration.titleFont,
                subtitle: "Toggle pipelines or operators by click:",
                subtitleFontSize: model.chartConfiguration.subtitleFontSize,
            },

            data: visData,

            signals: [
                {
                    name: "pieSize",
                    update: sunburstSize(),
                },
                {
                    name: "clickPipeline",
                    on: [
                        { events: [{ marktype: "arc", type: "click" }, { marktype: "text", markname: "labels", type: "click" }], update: "if(datum.parent === 'inner', datum.operator, null)" }
                    ]
                },
                {
                    name: "clickOperator",
                    on: [
                        { events: { marktype: "arc", type: "click" }, update: "if(datum.parent !== 'inner' && datum.operator !== 'inner', [datum.operator, datum.parent], null)" }
                    ]
                },
                {
                    name: "cursor",
                    value: "default",
                    on: [
                        { events: { type: "mouseover", marktype: "arc" }, update: { value: "pointer" } },
                        { events: "arc:mouseout", update: { value: "default" } }
                    ]
                }
            ],

            scales: [
                {
                    name: "colorOperatorsId",
                    type: "ordinal",
                    domain: this.props.operators!.operatorsId,
                    range: model.chartConfiguration.colorScale!.operatorsIdColorScale,
                },
                {
                    name: "colorOperatorsIdInactive",
                    type: "ordinal",
                    domain: this.props.operators!.operatorsId,
                    range: model.chartConfiguration.colorScale!.operatorsIdColorScaleLowOpacity,
                },
                {
                    name: "colorOperatorsGroup",
                    type: "ordinal",
                    domain: this.props.operators!.operatorsGroup,
                    range: model.chartConfiguration.colorScale!.operatorsGroupScale,
                }
            ],

            marks: [
                {
                    type: "arc",
                    from: { "data": "tree" },
                    encode: {
                        enter: {
                            x: { signal: "width / 2" },
                            y: this.props.doubleRowSize ? { signal: "height / 2.5" } : { signal: "height / 2" },
                            tooltip: [
                                { test: "datum.parent === 'inner'", signal: model.chartConfiguration.sunburstChartTooltip(true) },
                                { test: "datum.opOccurrences > 0", signal: model.chartConfiguration.sunburstChartTooltip(false) }
                            ],
                        },
                        update: {
                            startAngle: { field: "a0" },
                            endAngle: { field: "a1" },
                            innerRadius: { field: "r0" },
                            outerRadius: { field: "r1" },
                            stroke: { value: "white" },
                            strokeWidth: { value: 0.5 },
                            zindex: { value: 0 },
                            fillOpacity: { value: 1 },
                            fill: [
                                { test: "datum.parent==='inner' && indata('selectedPipelines', 'pipelinesUsed', datum.operator)", value: this.props.appContext.secondaryColor }, // use orange app color if pipeline is selected
                                { test: "datum.parent==='inner'", value: this.props.appContext.tertiaryColor }, //use grey app color if pipeline is not selected
                                { test: "indata('selectedOperators', 'operatorsUsed', datum.operator) && indata('selectedPipelines', 'pipelinesUsed', datum.parent)", scale: "colorOperatorsId", field: "operator" }, // use normal operator color scale if operator is selected (inner operator not colored as not in scale domain), do not use normal scale if whole pipeline is not selected   
                                { test: "datum.operator !== 'inner'", scale: "colorOperatorsIdInactive", field: "operator" } //use low opacity operators scale for all other cases for operators as they do not have inner as parent (inner operator not colored as not in scale domain)
                            ],
                        },
                        hover: {
                            fillOpacity: {
                                value: model.chartConfiguration.hoverFillOpacity,
                            },
                        }
                    }
                },
                {
                    type: "text",
                    name: "labels",
                    from: { data: "tree" },
                    encode: {
                        enter: {
                            fontSize: { value: model.chartConfiguration.sunburstChartValueLabelFontSize },
                            font: model.chartConfiguration.valueLabelFont,
                            x: { signal: "width/ 2" },
                            y: this.props.doubleRowSize ? { signal: "height / 2.5" } : { signal: "height / 2" },
                            radius: { signal: "(datum['r0'] + datum['r1'])/2 " },
                            theta: { signal: "(datum['a0'] + datum['a1'])/2" },
                            fill: [
                                { test: "indata('selectedPipelines', 'pipelinesUsed', datum.operator)", value: "#fff" },
                                { value: "#000" },
                            ],
                            align: { value: "center" },
                            baseline: { value: "middle" },
                            text: { signal: "datum['pipelineShort']" },
                            fillOpacity: [
                                this.props.doubleRowSize ? { test: "(datum['a1'] - datum['a0']) < '0.1'", value: 0 } : { test: "(datum['a1'] - datum['a0']) < '0.3'", value: 0 },
                                { test: "datum.parent === 'inner'", value: 1 },
                                { value: 0 }
                            ]
                        }
                    }
                }
            ],
            legends: [
                {
                    fill: "colorOperatorsId", //just as dummy
                    labelOffset: -11,
                    title: "Pipelines",
                    orient: this.props.doubleRowSize ? "bottom-left" : "left",
                    labelFontSize: this.props.doubleRowSize ? model.chartConfiguration.legendDoubleLabelFontSize : model.chartConfiguration.legendLabelFontSize,
                    titleFontSize: this.props.doubleRowSize ? model.chartConfiguration.legendDoubleTitleFontSize : model.chartConfiguration.legendTitleFontSize,
                    values: pipelinesLegend(),
                    rowPadding: 0,
                    encode: {
                        labels: {
                            update: {
                                text: this.props.doubleRowSize ? { signal: "truncate(datum.value, 60)" } : { signal: "truncate(datum.value, 35)" },
                            }
                        }
                    }
                },
                {
                    fill: "colorOperatorsGroup",
                    title: "Operators",
                    orient: this.props.doubleRowSize ? "bottom-right" : "right",
                    direction: "vertical",
                    rowPadding: 2,
                    // columns:  this.props.doubleRowSize ? 1 : 3,
                    columnPadding: 3,
                    labelFontSize: this.props.doubleRowSize ? model.chartConfiguration.legendDoubleLabelFontSize : model.chartConfiguration.legendLabelFontSize,
                    titleFontSize: this.props.doubleRowSize ? model.chartConfiguration.legendDoubleTitleFontSize : model.chartConfiguration.legendTitleFontSize,
                    symbolSize: this.props.doubleRowSize ? model.chartConfiguration.legendDoubleSymbolSize : model.chartConfiguration.legendSymbolSize,
                    values: [...new Set(this.props.operators!.operatorsGroup)],
                    encode: {
                        labels: {
                            update: {
                                text: this.props.doubleRowSize ? { signal: "truncate(datum.value, 20)" } : { signal: "truncate(datum.value, 15)" },
                            }
                        }
                    }
                }
            ],
        } as VisualizationSpec;

        return spec;
    }
}

const mapStateToProps = (state: model.AppState, ownProps: model.ISunburstChartProps) => ({
    currentPipeline: state.currentPipeline,
    currentOperator: state.currentOperator,
    pipelines: state.pipelines,
    pipelinesShort: state.pipelinesShort,
    operators: state.operators,
    chartData: state.chartData[ownProps.chartId].chartData.data as model.ISunburstChartData,
});


export default connect(mapStateToProps, undefined)(Context.withAppContext(SunburstChart));
