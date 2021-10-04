import * as model from '../../model';
import * as Controller from '../../controller/request_controller';
import * as Context from '../../app_context';
import React from 'react';
import { connect } from 'react-redux';
import { Vega } from 'react-vega';
import { VisualizationSpec } from "react-vega/src";
import { Redirect } from 'react-router-dom';
import { createRef } from 'react';
import { CircularProgress } from '@material-ui/core';


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
    currentPipeline: Array<string> | undefined,
    currentInterpolation: String,
    currentBucketSize: number,
    currentTimeBucketSelectionTuple: [number, number],
    setCurrentChart: (newCurrentChart: string) => void;
    setChartIdCounter: (newChartIdCounter: number) => void;
}

interface State {
    chartId: number,
    chartData: IChartData | undefined,
    width: number,
}

interface IChartData {
    buckets: Array<number>,
    operators: Array<string>,
    frequency: Array<number>,
}


class SwimLanesCombinedMultiplePipelines extends React.Component<Props, State> {

    chartWrapper = createRef<HTMLDivElement>();
    elementWrapper = createRef<HTMLDivElement>();

    constructor(props: Props) {
        super(props);
        this.state = {
            chartId: this.props.chartIdCounter,
            width: 0,
            chartData: undefined,
        };
        this.props.setChartIdCounter(this.state.chartId + 1);

        this.createVisualizationSpec = this.createVisualizationSpec.bind(this);
    }

    componentDidUpdate(prevProps: Props, prevState: State): void {

        //ensure changed app state and only proceed when result available
        if (!this.props.resultLoading[this.state.chartId] && this.props.chartData[this.state.chartId] && prevProps.resultLoading[this.state.chartId] !== this.props.resultLoading[this.state.chartId]) {

            const chartDataElement: IChartData = {
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

        //if current event, chart, bucketsize, timeframe or pipelines change, component did update is executed and queries new data for new event and pipelines selected only if current event and current pipelines already set
        if (this.props.currentEvent &&
            this.props.currentPipeline &&
            (this.props.currentEvent !== prevProps.currentEvent ||
                this.props.currentBucketSize !== prevProps.currentBucketSize ||
                this.props.chartIdCounter !== prevProps.chartIdCounter ||
                this.props.currentPipeline?.length !== prevProps.currentPipeline?.length ||
                this.props.currentTimeBucketSelectionTuple !== prevProps.currentTimeBucketSelectionTuple)) {

            Controller.requestChartData(this.props.appContext.controller, this.state.chartId, model.ChartType.SWIM_LANES_COMBINED_MULTIPLE_PIPELINES, { bucksetsize: "" + this.props.currentBucketSize, pipeline: this.props.currentPipeline, timeBucketFrame: this.props.currentTimeBucketSelectionTuple });

        }

    }


    componentDidMount() {
        this.setState((state, props) => ({
            ...state,
            width: this.elementWrapper.current!.offsetWidth,
        }));

        if (this.props.csvParsingFinished) {

            this.props.setCurrentChart(model.ChartType.SWIM_LANES_COMBINED_MULTIPLE_PIPELINES);

            if (!this.props.currentPipeline) {
                Controller.requestPipelines(this.props.appContext.controller);
            }
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

        return <div ref={this.elementWrapper}>
            {(this.props.resultLoading[this.state.chartId] || !this.state.chartData || !this.props.events)
                ? <CircularProgress />
                : <div className={"vegaContainer"} ref={this.chartWrapper}>
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

        const spec: VisualizationSpec = {
            $schema: "https://vega.github.io/schema/vega/v5.json",
            width: this.state.width - 60,
            height: this.state.width / 5.5,
            padding: { left: 5, right: 5, top: 5, bottom: 5 },
            resize: true,
            autosize: 'fit',

            title: {
                text: 'Swim Lanes (variable Pipelines)',
                align: model.chartConfiguration.titleAlign,
                dy: model.chartConfiguration.titlePadding,
                fontSize: model.chartConfiguration.titleFontSize,
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
                    range: {
                        scheme: "tableau20",
                    },
                    domain: {
                        data: "table",
                        field: "operators"
                    }
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
                                    tooltip: {
                                        "field": "buckets",
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
                fill: "color",
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
    currentEvent: state.currentEvent,
    currentRequest: state.currentRequest,
    events: state.events,
    chartIdCounter: state.chartIdCounter,
    chartData: state.chartData,
    currentPipeline: state.currentPipeline,
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
