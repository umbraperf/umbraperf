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
    pipelines: Array<string> | undefined;
    currentTimeBucketSelectionTuple: [number, number],
    setCurrentChart: (newCurrentChart: string) => void;
    setChartIdCounter: (newChartIdCounter: number) => void;
    setCurrentPipeline: (newCurrentPipeline: Array<string>) => void;

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
        this.handleCklickPipeline = this.handleCklickPipeline.bind(this);
    }

    componentDidUpdate(prevProps: Props): void {

        //if current event, timeframe or chart changes, component did update is executed and queries new data for new event, only if curent event already set
        if (this.props.currentEvent &&
            this.props.pipelines &&
            (this.props.currentEvent !== prevProps.currentEvent ||
                this.props.chartIdCounter !== prevProps.chartIdCounter ||
                this.props.pipelines !== prevProps.pipelines ||
                !_.isEqual(this.props.currentTimeBucketSelectionTuple, prevProps.currentTimeBucketSelectionTuple))) {
            Controller.requestChartData(this.props.appContext.controller, this.state.chartId, model.ChartType.SUNBURST_CHART);
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

            if (undefined === this.props.pipelines) {
                Controller.requestPipelines(this.props.appContext.controller);
            }

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


    public render() {

        if (!this.props.csvParsingFinished) {
            return <Redirect to={"/upload"} />
        }

        return <div ref={this.elementWrapper} style={{ display: "flex", height: "100%" }}>
            {(this.props.resultLoading[this.state.chartId] || !this.props.chartData[this.state.chartId] || !this.props.events || !this.props.pipelines)
                ? <Spinner />
                : <div className={"vegaContainer"}>
                    <Vega spec={this.createVisualizationSpec()} signalListeners={this.createVegaSignalListeners()} />
                </div>
            }
        </div>;
    }

    createVegaSignalListeners() {
        const signalListeners: SignalListeners = {
            clickPipeline: this.handleCklickPipeline,
        }
        return signalListeners;
    }

    handleCklickPipeline(...args: any[]) {
        if (args[1]) {
            console.log(args[1]);
            const selectedPipeline = args[1];
            if (this.props.currentPipeline === "All") {
                this.props.setCurrentPipeline(this.props.pipelines!.filter(e => e !== selectedPipeline));
            } else {
                if (this.props.currentPipeline.includes(selectedPipeline)) {
                    this.props.setCurrentPipeline(this.props.currentPipeline.filter(e => e !== selectedPipeline));
                } else {
                    this.props.setCurrentPipeline(this.props.currentPipeline!.concat(selectedPipeline));
                }
            }
        }
    }

    createVisualizationData() {

        const operatorIdArray = ((this.props.chartData[this.state.chartId] as model.ChartDataObject).chartData.data as model.ISunburstChartData).operator;
        const parentPipelinesArray = ((this.props.chartData[this.state.chartId] as model.ChartDataObject).chartData.data as model.ISunburstChartData).parent;
        const operatorOccurrences = Array.from(((this.props.chartData[this.state.chartId] as model.ChartDataObject).chartData.data as model.ISunburstChartData).operatorOccurrences);
        const pipelineOccurrences = Array.from(((this.props.chartData[this.state.chartId] as model.ChartDataObject).chartData.data as model.ISunburstChartData).pipelineOccurrences);

        //create unique operators array for operators color scale
        const operatorsUnique = _.uniq(operatorIdArray.filter((elem, index) => (parentPipelinesArray[index] !== "inner" && elem !== "inner")));

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
                    // size: [{ "signal": "2 * PI" }, { "signal": "width / 4" }], //determine size of pipeline circles
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
        }

        ];

        return { data, operatorsUnique };
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
                subtitle: "(Toggle pipelines by click)",
                subtitleFontSize: model.chartConfiguration.subtitleFontSize,
            },

            data: visData.data,

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
                }
            ],

            scales: [
                {
                    name: "colorOperators",
                    type: "ordinal",
                    domain: visData.operatorsUnique,
                    range: { scheme: "tableau20" }
                },
                {
                    name: "colorPipelines",
                    type: "ordinal",
                    domain: this.props.pipelines,
                    range: { scheme: "oranges" }
                },
                {
                    name: "colorPipelinesDisabled",
                    type: "ordinal",
                    domain: this.props.pipelines,
                    range: { scheme: "greys" }
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
                                { scale: "colorOperators", field: "operator" } //fill operators as they do not have inner as parent (inner operator is not includes as it is not in domain of colorOperators scale)
                            ],
                        },
                        hover: {
                            fillOpacity: {
                                value: 0.5
                            }
                        }
                    }
                }
                // TODO lables
                /* ,
                {
                    "type": "text",
                    "from": { "data": "table" },
                    "encode": {
                        "enter": {
                            fontSize: { value: model.chartConfiguration.donutChartValueLabelFontSize },
                            font: model.chartConfiguration.valueLabelFont,
                            "x": { "signal": "if(width >= height, width, height) / 2" },
                            "y": { "signal": "if(width >= height, height, width) / 2" },
                            "radius": { "signal": "if(width >= height, height, width) / 2 * 1.02 * 0.65" },
                            "theta": { "signal": "(datum['startAngle'] + datum['endAngle'])/2" },
                            "fill": { "value": "#000" },
                            "align": { "value": "center" },
                            "baseline": { "value": "middle" },
                            "text": { "signal": "if(datum['endAngle'] - datum['startAngle'] < 0.3, '', format(datum['value'] , '.0f'))" },
                            "fillOpacity": [
                                { "test": "radius < 30", "value": 0 },
                                { "test": "datum['value'] === 0", "value": 0 },
                                { "value": 1 }
                            ],
                        }
                    }
                } */
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
                values: visData.operatorsUnique,
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
    pipelines: state.pipelines,
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
});


export default connect(mapStateToProps, mapDispatchToProps)(Context.withAppContext(SunburstChart));
