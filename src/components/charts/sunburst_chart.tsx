import * as model from '../../model';
import * as Controller from '../../controller/request_controller';
import * as Context from '../../app_context';
import Spinner from '../utils/spinner';
import React from 'react';
import { connect } from 'react-redux';
import { SignalListeners, Vega } from 'react-vega';
import { VisualizationSpec } from "react-vega/src";
import { Redirect } from 'react-router-dom';
import { createRef } from 'react';
import _, { values } from "lodash";
import { isFieldPredicate } from 'vega-lite/build/src/predicate';


interface Props {
    appContext: Context.IAppContext;
    resultLoading: model.ResultLoading;
    result: model.Result | undefined;
    csvParsingFinished: boolean;
    currentChart: string;
    currentEvent: string;
    currentRequest: model.RestQueryType | undefined;
    events: Array<string> | undefined;
    chartIdCounter: number;
    chartData: model.ChartDataKeyValue,
    currentPipeline: Array<string> | "All";
    currentOperator: Array<string> | "All";
    pipelines: Array<string> | undefined;
    operators: Array<string> | undefined;
    currentTimeBucketSelectionTuple: [number, number],
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

    componentDidUpdate(prevProps: Props): void {

        this.requestNewChartData(this.props, prevProps);
    }

    requestNewChartData(props: Props, prevProps: Props): void {
        if (this.newChartDataNeeded(props, prevProps)) {
            Controller.requestChartData(props.appContext.controller, this.state.chartId, model.ChartType.SUNBURST_CHART);
        }
    }

    newChartDataNeeded(props: Props, prevProps: Props): boolean {
        if (prevProps.currentEvent !== "Default" &&
            props.pipelines &&
            (props.currentEvent !== prevProps.currentEvent ||
                props.chartIdCounter !== prevProps.chartIdCounter ||
                props.pipelines !== prevProps.pipelines ||
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

            //TODO remove
            // if (undefined === this.props.pipelines) {
            //     Controller.requestPipelines(this.props.appContext.controller);
            // }
            // if (undefined === this.props.operators) {
            //     Controller.requestOperators(this.props.appContext.controller);
            // }

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
            console.log(args[1]);
            const selectedPipeline = args[1];
            if (this.props.currentPipeline === "All") {
                this.props.setCurrentPipeline(this.props.pipelines!.filter(e => e !== selectedPipeline));
            } else {
                if (this.props.currentPipeline.includes(selectedPipeline)) {
                    this.props.setCurrentPipeline(this.props.currentPipeline.filter(e => e !== selectedPipeline));
                } else {
                    this.props.setCurrentPipeline(this.props.currentPipeline.concat(selectedPipeline));
                }
            }
        }
    }


    handleClickOperator(...args: any[]) {
        if (args[1]) {
            const selectedOperator = args[1];
            if (this.props.currentOperator === "All") {
                console.log(this.props.currentOperator);
                this.props.setCurrentOperator(this.props.operators!.filter(e => e !== selectedOperator));
                console.log(this.props.currentOperator);
            } else {
                if (this.props.currentOperator.includes(selectedOperator)) {
                    this.props.setCurrentOperator(this.props.currentOperator.filter(e => e !== selectedOperator));
                } else {
                    this.props.setCurrentOperator(this.props.currentOperator.concat(selectedOperator));
                }
            }
        }
    }

    createVisualizationData() {

        const operatorIdArray = ((this.props.chartData[this.state.chartId] as model.ChartDataObject).chartData.data as model.ISunburstChartData).operator;
        const parentPipelinesArray = ((this.props.chartData[this.state.chartId] as model.ChartDataObject).chartData.data as model.ISunburstChartData).parent;
        const operatorOccurrences = Array.from(((this.props.chartData[this.state.chartId] as model.ChartDataObject).chartData.data as model.ISunburstChartData).operatorOccurrences);
        const pipelineOccurrences = Array.from(((this.props.chartData[this.state.chartId] as model.ChartDataObject).chartData.data as model.ISunburstChartData).pipelineOccurrences);

        //add datum for inner circle only on first rerender
        operatorIdArray[0] !== "inner" && operatorIdArray.unshift("inner");
        parentPipelinesArray[0] !== null && parentPipelinesArray.unshift(null);
        operatorOccurrences[0] !== null && operatorOccurrences.unshift(null);
        pipelineOccurrences[0] !== null && pipelineOccurrences.unshift(null);

        const data = [{

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
                    // size: [{ "signal": "2 * PI" }, { "signal": "width / 2" }], //determine size of pipeline circles
                    size: [{ "signal": "2 * PI" }, { "signal": "pieSize" }], //determine size of pipeline circles
                    as: ["a0", "r0", "a1", "r1", "depth", "children"]
                }
            ],

        },
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
                subtitle: "Toggle pipelines by click:",
                subtitleFontSize: model.chartConfiguration.subtitleFontSize,
            },

            data: visData,

            signals: [
                {
                    name: "pieSize",
                    update: "if(width > 140, 75, 50)"
                },
                {
                    name: "clickPipeline",
                    on: [
                        { events: { marktype: "arc", type: "click" }, update: "if(datum.parent === 'inner', datum.operator, null)" }
                    ]
                },
                {
                    name: "clickOperator",
                    on: [
                        { events: { marktype: "arc", type: "click" }, update: "if(datum.parent !== 'inner' && datum.operator !== 'inner', datum.operator, null)" }
                    ]
                }
            ],

            scales: [
                {
                    name: "colorOperators",
                    type: "ordinal",
                    domain: this.props.operators,
                    range: { scheme: model.chartConfiguration.operatorColorSceme }
                },
                {
                    name: "colorPipelines",
                    type: "ordinal",
                    domain: this.props.pipelines,
                    range: { scheme: model.chartConfiguration.pipelineColorSceme }
                },
                {
                    name: "colorPipelinesDisabled",
                    type: "ordinal",
                    domain: this.props.pipelines,
                    range: { scheme: model.chartConfiguration.disabledColorSceme }
                },
                {
                    name: "colorOperatorsDisabled",
                    type: "ordinal",
                    domain: this.props.operators,
                    range: { scheme: model.chartConfiguration.disabledColorSceme }
                }
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
                                { test: "datum.parent==='inner' && indata('selectedPipelines', 'pipelinesUsed', datum.operator)", scale: "colorPipelines", field: "operator" }, // use orange color scale if pipeline is selected
                                { test: "datum.parent==='inner'", scale: "colorPipelinesDisabled", field: "operator" }, //use grey color scale if pipeline is not selected
                                { test: "indata('selectedOperators', 'operatorsUsed', datum.operator) && indata('selectedPipelines', 'pipelinesUsed', datum.parent)", scale: "colorOperators", field: "operator" }, // use normal operator color scale if operator is selected (inner operator not colored as not in scale domain), do not use normal scale if whole pipeline is not selected   
                                { scale: "colorOperatorsDisabled", field: "operator" } //use grey color scale for operators operators as they do not have inner as parent (inner operator not colored as not in scale domain)
                            ],
                        },
                        hover: {
                            fillOpacity: {
                                value: model.chartConfiguration.hoverFillOpacity,
                            },
                        }
                    }
                }
            ],
            legends: [{
                fill: "colorPipelines",
                title: "Pipelines",
                orient: "right",
                labelFontSize: model.chartConfiguration.legendLabelFontSize,
                titleFontSize: model.chartConfiguration.legendTitleFontSize,
                symbolSize: model.chartConfiguration.legendSymbolSize,
                values: this.props.pipelines,
            },
            {
                fill: "colorOperators",
                title: "Operators",
                orient: "right",
                direction: "vertical",
                columns: 3,
                labelFontSize: model.chartConfiguration.legendLabelFontSize,
                titleFontSize: model.chartConfiguration.legendTitleFontSize,
                symbolSize: model.chartConfiguration.legendSymbolSize,
                values: this.props.operators,
                encode: {
                    labels: {
                        update: {
                            text: { signal: "truncate(datum.value, 9)" },
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
    result: state.result,
    csvParsingFinished: state.csvParsingFinished,
    currentChart: state.currentChart,
    currentEvent: state.currentEvent,
    currentRequest: state.currentRequest,
    events: state.events,
    chartIdCounter: state.chartIdCounter,
    chartData: state.chartData,
    currentPipeline: state.currentPipeline,
    currentOperator: state.currentOperator,
    pipelines: state.pipelines,
    operators: state.operators,
    currentTimeBucketSelectionTuple: state.currentTimeBucketSelectionTuple,
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
