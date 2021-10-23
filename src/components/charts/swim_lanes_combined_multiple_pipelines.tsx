import * as model from '../../model';
import * as Controller from '../../controller/request_controller';
import * as Context from '../../app_context';
import React from 'react';
import Spinner from '../utils/spinner';
import { connect } from 'react-redux';
import { Vega } from 'react-vega';
import { VisualizationSpec } from "react-vega/src";
import { Redirect } from 'react-router-dom';
import { createRef } from 'react';
import _ from "lodash";


interface Props {
    appContext: Context.IAppContext;
    resultLoading: model.ResultLoading;
    result: model.Result | undefined;
    csvParsingFinished: boolean;
    currentChart: string;
    currentMultipleEvent: [string, string] | "Default";
    events: Array<string> | undefined;
    operators: Array<string> | undefined;
    chartIdCounter: number;
    chartData: model.ChartDataKeyValue,
    currentOperator: Array<string> | "All",
    currentPipeline: Array<string> | "All",
    currentInterpolation: String,
    currentBucketSize: number,
    currentTimeBucketSelectionTuple: [number, number],
    setCurrentChart: (newCurrentChart: string) => void;
    setChartIdCounter: (newChartIdCounter: number) => void;

    absoluteValues?: boolean;
}

interface State {
    chartId: number,
    width: number,
    height: number,
}


class SwimLanesCombinedMultiplePipelines extends React.Component<Props, State> {

    elementWrapper = createRef<HTMLDivElement>();

    constructor(props: Props) {
        super(props);
        this.state = {
            chartId: this.props.chartIdCounter,
            width: 0,
            height: 0,
        };
        this.props.setChartIdCounter(this.state.chartId + 1);

        this.createVisualizationSpec = this.createVisualizationSpec.bind(this);
    }

    componentDidUpdate(prevProps: Props, prevState: State): void {

        this.requestNewChartData(this.props, prevProps);

    }

    requestNewChartData(props: Props, prevProps: Props): void {
        if (this.newChartDataNeeded(props, prevProps)) {
            if (props.absoluteValues) {
                Controller.requestChartData(props.appContext.controller, this.state.chartId, model.ChartType.SWIM_LANES_COMBINED_MULTIPLE_PIPELINES_ABSOLUTE);
            } else {
                Controller.requestChartData(props.appContext.controller, this.state.chartId, model.ChartType.SWIM_LANES_COMBINED_MULTIPLE_PIPELINES);
            }
        }
    }

    newChartDataNeeded(props: Props, prevProps: Props): boolean {
        if (this.props.events &&
            this.props.operators &&
            (props.chartIdCounter !== prevProps.chartIdCounter ||
                props.currentBucketSize !== prevProps.currentBucketSize ||
                !_.isEqual(props.operators, prevProps.operators) ||
                !_.isEqual(props.currentMultipleEvent, prevProps.currentMultipleEvent) ||
                !_.isEqual(props.currentOperator, prevProps.currentOperator) ||
                !_.isEqual(props.currentPipeline, prevProps.currentPipeline) ||
                !_.isEqual(props.currentTimeBucketSelectionTuple, prevProps.currentTimeBucketSelectionTuple))) {
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

            this.props.setCurrentChart(this.props.absoluteValues ? model.ChartType.SWIM_LANES_COMBINED_MULTIPLE_PIPELINES_ABSOLUTE : model.ChartType.SWIM_LANES_COMBINED_MULTIPLE_PIPELINES);

            addEventListener('resize', (event) => {
                this.resizeListener();
            });
        }
    }

    componentWillUnmount() {
        removeEventListener('resize', (event) => {
            this.resizeListener();
        });
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
        if (this.props.resultLoading[this.state.chartId] || !this.props.chartData[this.state.chartId] || !this.props.operators) {
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
                    <Vega className={`vegaSwimlaneMultiplePipelines}`} spec={this.createVisualizationSpec()} />
                </div>
            }
        </div>;
    }

    createVisualizationData() {

        const chartDataElementPos: model.ISwimlanesData = {
            buckets: ((this.props.chartData[this.state.chartId] as model.ChartDataObject).chartData.data as model.ISwimlanesCombinedData).buckets,
            operators: ((this.props.chartData[this.state.chartId] as model.ChartDataObject).chartData.data as model.ISwimlanesCombinedData).operators,
            frequency: ((this.props.chartData[this.state.chartId] as model.ChartDataObject).chartData.data as model.ISwimlanesCombinedData).frequency,
        }

        const chartDataElementNeg: model.ISwimlanesData = {
            buckets: ((this.props.chartData[this.state.chartId] as model.ChartDataObject).chartData.data as model.ISwimlanesCombinedData).bucketsNeg,
            operators: ((this.props.chartData[this.state.chartId] as model.ChartDataObject).chartData.data as model.ISwimlanesCombinedData).operatorsNeg,
            frequency: ((this.props.chartData[this.state.chartId] as model.ChartDataObject).chartData.data as model.ISwimlanesCombinedData).frequencyNeg,
        }

        const data = [{
            name: "tablePos",
            values: chartDataElementPos,
            transform: [
                { "type": "flatten", "fields": ["buckets", "operators", "frequency"] },
                { "type": "collect", "sort": { "field": "operators" } },
                { "type": "stack", "groupby": ["buckets"], "field": "frequency" }
            ]
        },
        {
            name: "tableNeg",
            values: chartDataElementNeg,
            transform: [
                { "type": "flatten", "fields": ["buckets", "operators", "frequency"] },
                { "type": "collect", "sort": { "field": "operators" } },
                { "type": "stack", "groupby": ["buckets"], "field": "frequency" }
            ]
        }
        ];

        const mergedBucketsPosNeg = _.sortBy(_.uniq(_.union(chartDataElementPos.buckets, chartDataElementNeg.buckets)));

        return { data: data, mergedBucketsPosNeg: mergedBucketsPosNeg };
    }

    createVisualizationSpec() {
        const visData = this.createVisualizationData();

        const xTicks = () => {

            const numberOfTicks = 20;

            const mergedBucketsPosNegLength = visData.mergedBucketsPosNeg.length;

            if (mergedBucketsPosNegLength > numberOfTicks) {
                let ticks = [];
                const delta = Math.floor(mergedBucketsPosNegLength / numberOfTicks);
                for (let i = 0; i < mergedBucketsPosNegLength; i = i + delta) {
                    ticks.push(visData.mergedBucketsPosNeg[i]);
                }
                return ticks;
            }

        }

        const spec: VisualizationSpec = {
            $schema: "https://vega.github.io/schema/vega/v5.json",
            width: this.state.width - 60,
            height: this.state.height - 10,
            padding: { left: 5, right: 5, top: 5, bottom: 5 },
            resize: true,
            autosize: 'fit',

            title: {
                text: `Swim Lanes for multiple Events (variable Pipelines) with ${this.props.absoluteValues ? "Absolute" : "Relative"} Frequencies`,
                align: model.chartConfiguration.titleAlign,
                dy: model.chartConfiguration.titlePadding,
                fontSize: model.chartConfiguration.titleFontSize,
                font: model.chartConfiguration.titleFont
            },

            data: visData.data,

            scales: [
                {
                    name: "x",
                    type: "point",
                    range: "width",
                    domain: visData.mergedBucketsPosNeg,
                },
                {
                    name: "y",
                    type: "linear",
                    range: [{ signal: "height/2" }, 0],
                    nice: true,
                    zero: true,
                    domain: {
                        fields: [
                            { data: "tablePos", field: "y1" },
                        ]
                    }
                },
                {
                    name: "yNeg",
                    type: "linear",
                    range: [{ signal: "height" }, { signal: "height/2" }],
                    nice: true,
                    zero: true,
                    reverse: true, //down counting values
                    domain: {
                        fields: [
                            { data: "tableNeg", field: "y1" }
                        ]
                    }
                },
                {
                    name: "colorPos",
                    type: "ordinal",
                    range: model.chartConfiguration.getOperatorColorScheme(this.props.operators!.length),
                    domain: this.props.operators,
                },
                {
                    name: "colorNeg",
                    type: "ordinal",
                    range: model.chartConfiguration.getOperatorColorScheme(this.props.operators!.length, true),
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
                    title: this.props.currentMultipleEvent[0],
                    titlePadding: model.chartConfiguration.axisPadding,
                    labelFontSize: model.chartConfiguration.axisLabelFontSize,
                    labelSeparation: model.chartConfiguration.areaChartYLabelSeparation,
                    labelOverlap: true,
                    titleFontSize: model.chartConfiguration.axisTitleFontSizeYCombined,
                    titleFont: model.chartConfiguration.axisTitleFont,
                    labelFont: model.chartConfiguration.axisLabelFont,
                },
                ,
                {
                    orient: "left",
                    scale: "yNeg",
                    zindex: 1,
                    title: this.props.currentMultipleEvent[1],
                    titlePadding: model.chartConfiguration.axisPadding,
                    labelFontSize: model.chartConfiguration.axisLabelFontSize,
                    labelSeparation: model.chartConfiguration.areaChartYLabelSeparation,
                    labelOverlap: true,
                    titleFontSize: model.chartConfiguration.axisTitleFontSizeYCombined,
                    titleFont: model.chartConfiguration.axisTitleFont,
                    labelFont: model.chartConfiguration.axisLabelFont,
                }
            ],
            marks: [
                {
                    type: "group",
                    from: {
                        facet: {
                            name: "seriesPos",
                            data: "tablePos",
                            groupby: "operators"
                        }
                    },
                    marks: [
                        {
                            type: "area",
                            from: {
                                data: "seriesPos"
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
                                        scale: "colorPos",
                                        field: "operators"
                                    },
                                    tooltip: {
                                        signal: `{'Event': '${this.props.currentMultipleEvent[0]}', ${this.props.absoluteValues ? model.chartConfiguration.areaChartAbsoluteTooltip : model.chartConfiguration.areaChartTooltip}}`,
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
                },
                {
                    name: "backgroundNeg",
                    type: "rect",
                    encode: {
                        enter: {
                            x: { value: 0 },
                            x2: { signal: "width" },
                            y: { signal: "height/2" },
                            y2: { signal: "height" },
                            fill: { value: "#f0f0f0" },
                            opacity: { value: 0.5 },
                            zindex: 0,
                        }
                    }
                },
                {
                    type: "group",
                    from: {
                        facet: {
                            name: "seriesNeg",
                            data: "tableNeg",
                            groupby: "operators"
                        }
                    },
                    marks: [
                        {
                            type: "area",
                            from: {
                                data: "seriesNeg"
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
                                        scale: "yNeg",
                                        field: "y0"
                                    },
                                    y2: {
                                        scale: "yNeg",
                                        field: "y1"
                                    },
                                    fill: {
                                        scale: "colorNeg",
                                        field: "operators"
                                    },
                                    tooltip: {
                                        signal: `{'Event': '${this.props.currentMultipleEvent[1]}', ${this.props.absoluteValues ? model.chartConfiguration.areaChartAbsoluteTooltip : model.chartConfiguration.areaChartTooltip}}`,
                                    },

                                },
                                update: {
                                    fillOpacity: {
                                        value: 1
                                    }
                                },
                                hover: {
                                    fillOpacity: {
                                        value: 0.5
                                    }
                                }
                            }
                        }
                    ]
                }
            ],
            legends: [{
                fill: "colorPos",
                title: "Operators",
                orient: "right",
                labelFontSize: model.chartConfiguration.legendLabelFontSize,
                titleFontSize: model.chartConfiguration.legendTitleFontSize,
                symbolSize: model.chartConfiguration.legendSymbolSize,
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
    currentMultipleEvent: state.currentMultipleEvent,
    events: state.events,
    operators: state.operators,
    chartIdCounter: state.chartIdCounter,
    chartData: state.chartData,
    currentPipeline: state.currentPipeline,
    currentOperator: state.currentOperator,
    currentInterpolation: state.currentInterpolation,
    currentBucketSize: state.currentBucketSize,
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
});

export default connect(mapStateToProps, mapDispatchToProps)(Context.withAppContext(SwimLanesCombinedMultiplePipelines));
