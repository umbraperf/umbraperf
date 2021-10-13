import * as model from '../../model';
import * as Controller from '../../controller/request_controller';
import * as Context from '../../app_context';
import Spinner from '../utils/spinner';
import React from 'react';
import { connect } from 'react-redux';
import { Vega } from 'react-vega';
import { VisualizationSpec } from "../../../node_modules/react-vega/src";
import { Redirect } from 'react-router-dom';
import { createRef } from 'react';
import _ from "lodash";


interface Props {
    appContext: Context.IAppContext;
    resultLoading: model.ResultLoading;
    result: model.Result | undefined;
    csvParsingFinished: boolean;
    currentChart: string;
    currentEvent: string;
    currentRequest: model.RestQueryType | undefined;
    events: Array<string> | undefined;
    operators: Array<string> | undefined;
    chartIdCounter: number;
    chartData: model.ChartDataKeyValue,
    currentPipeline: Array<string> | "All",
    currentOperators: Array<string> | "All",
    currentInterpolation: String,
    currentBucketSize: number,
    currentTimeBucketSelectionTuple: [number, number],
    setCurrentChart: (newCurrentChart: string) => void;
    setChartIdCounter: (newChartIdCounter: number) => void;

    absoluteValues?: boolean;

}

interface State {
    chartId: number,
    chartData: model.ISwimlanesData | undefined,
    width: number,
    height: number,
}


class SwimLanesMultiplePipelines extends React.Component<Props, State> {

    elementWrapper = createRef<HTMLDivElement>();

    constructor(props: Props) {
        super(props);
        this.state = {
            chartId: this.props.chartIdCounter,
            width: 0,
            height: 0,
            chartData: undefined,
        };
        this.props.setChartIdCounter(this.state.chartId + 1);

        this.createVisualizationSpec = this.createVisualizationSpec.bind(this);
    }

    componentDidUpdate(prevProps: Props, prevState: State): void {

        //ensure changed app state and only proceed when result available
        if (!this.props.resultLoading[this.state.chartId] && this.props.chartData[this.state.chartId] && prevProps.resultLoading[this.state.chartId] !== this.props.resultLoading[this.state.chartId]) {

            const chartDataElement: model.ISwimlanesData = {
                buckets: ((this.props.chartData[this.state.chartId] as model.ChartDataObject).chartData.data as model.ISwimlanesData).buckets,
                operators: ((this.props.chartData[this.state.chartId] as model.ChartDataObject).chartData.data as model.ISwimlanesData).operators,
                frequency: ((this.props.chartData[this.state.chartId] as model.ChartDataObject).chartData.data as model.ISwimlanesData).frequency,
            }

            this.setState((state, props) => {
                return {
                    ...this.state,
                    chartData: chartDataElement,
                }
            });

        }

        //if current event, chart, bucketsize, timeframe, operators selected or pipelines selected change, component did update is executed and queries new data for new event and pipelines selected only if current event and current pipelines already set
        if (prevProps.currentEvent !== "Default" &&
            (this.props.currentEvent !== prevProps.currentEvent ||
                this.props.currentOperators.length !== prevProps.currentOperators.length ||
                this.props.currentBucketSize !== prevProps.currentBucketSize ||
                this.props.chartIdCounter !== prevProps.chartIdCounter ||
                this.props.currentPipeline.length !== prevProps.currentPipeline.length ||
                !_.isEqual(this.props.currentTimeBucketSelectionTuple, prevProps.currentTimeBucketSelectionTuple))) {

            if (this.props.absoluteValues) {
                Controller.requestChartData(this.props.appContext.controller, this.state.chartId, model.ChartType.SWIM_LANES_MULTIPLE_PIPELINES_ABSOLUTE);
            } else {
                Controller.requestChartData(this.props.appContext.controller, this.state.chartId, model.ChartType.SWIM_LANES_MULTIPLE_PIPELINES);
            }
        }

    }


    componentDidMount() {
        this.setState((state, props) => ({
            ...state,
            width: this.elementWrapper.current!.offsetWidth,
            height: this.elementWrapper.current!.offsetHeight,
        }));

        if (this.props.csvParsingFinished) {

            this.props.absoluteValues ? this.props.setCurrentChart(model.ChartType.SWIM_LANES_MULTIPLE_PIPELINES_ABSOLUTE) : this.props.setCurrentChart(model.ChartType.SWIM_LANES_MULTIPLE_PIPELINES);

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


    public render() {

        if (!this.props.csvParsingFinished) {
            return <Redirect to={"/upload"} />
        }

        return <div ref={this.elementWrapper} style={{ display: "flex", height: "100%" }}>
            {(this.props.resultLoading[this.state.chartId] || !this.state.chartData || !this.props.events)
                ? <Spinner />
                : <div className={"vegaContainer"}>
                    <Vega className={`vegaSwimlaneMultiplePipelines}`} spec={this.createVisualizationSpec()} />
                </div>
            }
        </div>;
    }

    createVisualizationData() {

        const data = {
            "name": "table",
            "values": this.state.chartData,
            transform: [
                { "type": "flatten", "fields": ["buckets", "operators", "frequency"] },
                { "type": "collect", "sort": { "field": "operators" } },
                { "type": "stack", "groupby": ["buckets"], "field": "frequency" }
            ]
        };

        return data;
    }

    createVisualizationSpec() {
        const visData = this.createVisualizationData();

        const xTicks = () => {

            const bucketsArrayLength = this.state.chartData!.buckets.length;
            const numberOfTicks = 20;

            if (bucketsArrayLength > numberOfTicks) {

                let ticks = [];

                const delta = Math.floor(bucketsArrayLength / numberOfTicks);

                for (let i = 0; i < bucketsArrayLength; i = i + delta) {
                    ticks.push(this.state.chartData!.buckets[i]);
                }
                return ticks;
            }

        }

        const yScale = () => {
            if (this.props.absoluteValues) {
                return {
                    name: "y",
                    type: "linear",
                    range: "height",
                    nice: true,
                    zero: true,
                    domain: { data: "table", field: "y1" }
                };
            } else {
                return {
                    name: "y",
                    type: "linear",
                    range: "height",
                    nice: true,
                    zero: true,
                    domain: [0, 1]
                };
            }
        }

        const spec: VisualizationSpec = {
            $schema: "https://vega.github.io/schema/vega/v5.json",
            width: this.state.width - 55,
            height: this.state.height - 10,
            padding: { left: 5, right: 5, top: 5, bottom: 5 },
            resize: true,
            autosize: 'fit',

            title: {
                text: 'Swim Lanes (variable Pipelines)',
                align: model.chartConfiguration.titleAlign,
                dy: model.chartConfiguration.titlePadding,
                fontSize: model.chartConfiguration.titleFontSize,
                font: model.chartConfiguration.titleFont
            },

            data: [
                visData
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
                yScale(),
                {
                    name: "color",
                    type: "ordinal",
                    range: {
                        scheme: model.chartConfiguration.operatorColorSceme,
                    },
                    domain: this.props.operators,
                }
            ],
            axes: [
                {
                    orient: "bottom",
                    scale: "x",
                    zindex: 1,
                    labelOverlap: false,
                    values: xTicks(),
                    title: model.chartConfiguration.areaChartXTitle,
                    titlePadding: model.chartConfiguration.axisPadding,
                    labelFontSize: model.chartConfiguration.axisLabelFontSize,
                    titleFontSize: model.chartConfiguration.axisTitleFontSize,
                    titleFont: model.chartConfiguration.axisTitleFont,
                    labelFont: model.chartConfiguration.axisLabelFont,
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

const mapStateToProps = (state: model.AppState) => ({
    resultLoading: state.resultLoading,
    result: state.result,
    csvParsingFinished: state.csvParsingFinished,
    currentChart: state.currentChart,
    currentEvent: state.currentEvent,
    currentRequest: state.currentRequest,
    events: state.events,
    operators: state.operators,
    chartIdCounter: state.chartIdCounter,
    chartData: state.chartData,
    currentPipeline: state.currentPipeline,
    currentOperators: state.currentOperator,
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

export default connect(mapStateToProps, mapDispatchToProps)(Context.withAppContext(SwimLanesMultiplePipelines));
