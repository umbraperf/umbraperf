import * as model from '../../model';
import * as Controller from '../../controller';
import * as Context from '../../app_context';
import Spinner from '../utils/spinner';
import React from 'react';
import { connect } from 'react-redux';
import { SignalListeners, Vega } from 'react-vega';
import { VisualizationSpec } from "react-vega/src";
import { Redirect } from 'react-router-dom';
import { createRef } from 'react';
import _ from "lodash";


interface Props {
    appContext: Context.IAppContext;
    resultLoading: model.ResultLoading;
    csvParsingFinished: boolean;
    currentChart: string;
    currentEvent: string;
    events: Array<string> | undefined;
    chartIdCounter: number;
    chartData: model.ChartDataKeyValue,
    currentPipeline: Array<string> | "All";
    currentOperator: Array<string> | "All";
    pipelines: Array<string> | undefined;
    pipelinesShort: Array<string> | undefined;
    operators: Array<string> | undefined;
    currentTimeBucketSelectionTuple: [number, number],
    currentView: model.ViewType;
    setCurrentChart: (newCurrentChart: string) => void;
    setChartIdCounter: (newChartIdCounter: number) => void;
    setCurrentPipeline: (newCurrentPipeline: Array<string>) => void;
    setCurrentOperator: (newCurrentOperator: Array<string>) => void;


}

interface State {
    chartId: number,
    width: number,
    height: number,
}

class SunburstChart extends React.Component<Props, State> {

    elementWrapper = createRef<HTMLDivElement>();

    constructor(props: Props) {
        super(props);
        this.state = {
            chartId: this.props.chartIdCounter,
            width: 0,
            height: 0,
        };
        this.props.setChartIdCounter((this.state.chartId) + 1);

        this.createVisualizationSpec = this.createVisualizationSpec.bind(this);
        this.handleClickPipeline = this.handleClickPipeline.bind(this);
        this.handleClickOperator = this.handleClickOperator.bind(this);
    }

    shouldComponentUpdate(nextProps: Props, nextState: State) {

        if(this.props.resultLoading[this.state.chartId] !== nextProps.resultLoading[this.state.chartId]){
            return true;
        }
        if(!_.isEqual(this.props.resultLoading, nextProps.resultLoading)){
            return false;
        }
        return true;
    }

    componentDidUpdate(prevProps: Props): void {

        this.requestNewChartData(this.props, prevProps);
    }

    requestNewChartData(props: Props, prevProps: Props): void {
        if (this.newChartDataNeeded(props, prevProps)) {
            Controller.requestChartData(props.appContext.controller, this.state.chartId, model.ChartType.SUNBURST_CHART);
        }
    }

    newChartDataNeeded(props: Props, prevProps: Props): boolean {
        if (this.props.events &&
            this.props.pipelines &&
            this.props.operators &&
            (props.currentEvent !== prevProps.currentEvent ||
                props.currentView !== prevProps.currentView ||
                !_.isEqual(this.props.pipelines, prevProps.pipelines) ||
                !_.isEqual(this.props.operators, prevProps.operators) ||
                !_.isEqual(this.props.currentTimeBucketSelectionTuple, prevProps.currentTimeBucketSelectionTuple))) {
            return true;
        } else {
            return false;
        }
    }

    componentDidMount() {

        this.setState((state, props) => ({
            ...state,
            width: this.elementWrapper.current!.offsetWidth,
            height: this.elementWrapper.current!.offsetHeight,
        }));

        if (this.props.csvParsingFinished) {

            this.props.setCurrentChart(model.ChartType.SUNBURST_CHART);

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

            child.style.display = 'block';
        }


    }

    isComponentLoading(): boolean {
        if (this.props.resultLoading[this.state.chartId] || !this.props.chartData[this.state.chartId] || !this.props.pipelines || !this.props.operators) {
            return true;
        } else {
            return false;
        }
    }

    public render() {

        if (!this.props.csvParsingFinished) {
            return <Redirect to={"/upload"} />
        }

        return <div ref={this.elementWrapper} style={{ display: "flex", height: "100%" }}>
            {this.isComponentLoading()
                ? <Spinner />
                : <div className={"vegaContainer"}>
                    <Vega spec={this.createVisualizationSpec()} signalListeners={this.createVegaSignalListeners()} />
                </div>
            }
        </div>;
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
            const selectedOperator = args[1][0];
            const selectedOperatorPipeline = args[1][1];
            if (this.props.currentOperator === "All" || !this.props.currentOperator.includes("")) {
                this.props.setCurrentOperator(this.props.operators!.map((elem, index) => (elem === selectedOperator ? elem : "")));
            } else {
                const selectedIndexPosition = this.props.operators!.indexOf(selectedOperator);
                if (this.props.currentOperator[selectedIndexPosition] === "") {
                    if (!this.props.currentPipeline.includes(selectedOperatorPipeline)) {
                        this.handleClickPipeline(undefined, selectedOperatorPipeline);
                    }
                    this.props.setCurrentOperator(this.props.currentOperator.map((elem, index) => (index === selectedIndexPosition ? this.props.operators![index] : elem)));
                } else {
                    this.props.setCurrentOperator(this.props.currentOperator.map((elem, index) => (index === selectedIndexPosition ? "" : elem)));
                }
            }
        }
    }

    createVisualizationData() {

        const operatorIdArray = ((this.props.chartData[this.state.chartId] as model.ChartDataObject).chartData.data as model.ISunburstChartData).operator;
        const parentPipelinesArray = ((this.props.chartData[this.state.chartId] as model.ChartDataObject).chartData.data as model.ISunburstChartData).pipeline;
        const operatorOccurrences = Array.from(((this.props.chartData[this.state.chartId] as model.ChartDataObject).chartData.data as model.ISunburstChartData).opOccurrences);
        const pipelineOccurrences = Array.from(((this.props.chartData[this.state.chartId] as model.ChartDataObject).chartData.data as model.ISunburstChartData).pipeOccurrences);

        //add datum for inner circle at beginning of data only on first rerender
        operatorIdArray[0] !== "inner" && operatorIdArray.unshift("inner");
        parentPipelinesArray[0] !== null && parentPipelinesArray.unshift(null);
        operatorOccurrences[0] !== null && operatorOccurrences.unshift(null);
        pipelineOccurrences[0] !== null && pipelineOccurrences.unshift(null);

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
                values: { operatorsUsed: this.props.currentOperator === "All" ? this.props.operators : this.props.currentOperator },
                transform: [
                    {
                        type: "flatten",
                        fields: ["operatorsUsed"]
                    }
                ]
            },
            {
                name: "tree",
                values: [
                    { operator: operatorIdArray, parent: parentPipelinesArray, pipeOccurrences: pipelineOccurrences, opOccurrences: operatorOccurrences }
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
                        sort: { "field": "value" },
                        size: [{ "signal": "2 * PI" }, { "signal": "pieSize" }], //determine size of pipeline circles
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
                    }
                ],

            },
        ];

        return data;
    }

    createVisualizationSpec() {
        const visData = this.createVisualizationData();

        const pipelinesLegend = () => {
            return this.props.pipelines!.map((elem, index) => (this.props.pipelinesShort![index] + ": " + elem));
        }

        const spec: VisualizationSpec = {
            $schema: "https://vega.github.io/schema/vega/v5.json",
            width: this.state.width - 50,
            height: this.state.height - 10,
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
                    update: "if(width > 160, 75, 50)"
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
                }
            ],

            scales: [
                {
                    name: "colorOperators",
                    type: "ordinal",
                    domain: this.props.operators,
                    range: model.chartConfiguration.getOperatorColorScheme(this.props.operators!.length),
                },
            ],

            marks: [
                {
                    type: "arc",
                    from: { "data": "tree" },
                    encode: {
                        enter: {
                            x: { signal: "width / 2" },
                            y: { signal: "height / 2" },
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
                                { test: "indata('selectedOperators', 'operatorsUsed', datum.operator) && indata('selectedPipelines', 'pipelinesUsed', datum.parent)", scale: "colorOperators", field: "operator" }, // use normal operator color scale if operator is selected (inner operator not colored as not in scale domain), do not use normal scale if whole pipeline is not selected   
                                { test: "datum.operator !== 'inner'", value: this.props.appContext.tertiaryColor } //use grey app color for operators operators as they do not have inner as parent (inner operator not colored as not in scale domain)
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
                            y: { signal: "height/ 2" },
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
                                { test: "(datum['a1'] - datum['a0']) < '0.3'", value: 0 },
                                { test: "datum.parent === 'inner'", value: 1 },
                                { value: 0 }
                            ]
                        }
                    }
                }
            ],
            legends: [
                {
                    fill: "colorOperators", //just as dummy
                    labelOffset: -11,
                    title: "Pipelines",
                    orient: "right",
                    labelFontSize: model.chartConfiguration.legendLabelFontSize,
                    titleFontSize: model.chartConfiguration.legendTitleFontSize,
                    values: pipelinesLegend(),
                    rowPadding: 0,
                    encode: {
                        labels: {
                            update: {
                                text: { signal: "truncate(datum.value, 35)" },
                            }
                        }
                    }
                },
                {
                    fill: "colorOperators",
                    title: "Operators",
                    orient: "right",
                    direction: "vertical",
                    rowPadding: 2,
                    columns: 3,
                    columnPadding: 3,
                    labelFontSize: model.chartConfiguration.legendLabelFontSize,
                    titleFontSize: model.chartConfiguration.legendTitleFontSize,
                    symbolSize: model.chartConfiguration.legendSymbolSize,
                    values: this.props.operators,
                    encode: {
                        labels: {
                            update: {
                                text: { signal: "truncate(datum.value, 8)" },
                            }
                        }
                    }
                }
            ],
        } as VisualizationSpec;

        return spec;
    }
}

const mapStateToProps = (state: model.AppState) => ({
    resultLoading: state.resultLoading,
    csvParsingFinished: state.csvParsingFinished,
    currentChart: state.currentChart,
    currentEvent: state.currentEvent,
    events: state.events,
    chartIdCounter: state.chartIdCounter,
    chartData: state.chartData,
    currentPipeline: state.currentPipeline,
    currentOperator: state.currentOperator,
    pipelines: state.pipelines,
    pipelinesShort: state.pipelinesShort,
    operators: state.operators,
    currentTimeBucketSelectionTuple: state.currentTimeBucketSelectionTuple,
    currentView: state.currentView,
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
    setCurrentPipeline: (newCurrentPipeline: Array<string>) => dispatch({
        type: model.StateMutationType.SET_CURRENTPIPELINE,
        data: newCurrentPipeline,
    }),
    setCurrentOperator: (newCurrentOperator: Array<string>) => dispatch({
        type: model.StateMutationType.SET_CURRENTOPERATOR,
        data: newCurrentOperator,
    }),
});


export default connect(mapStateToProps, mapDispatchToProps)(Context.withAppContext(SunburstChart));
