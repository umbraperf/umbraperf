import * as model from '../../model';
import React from 'react';
import { connect } from 'react-redux';
import { IAppContext, withAppContext } from '../../app_context';
import { SignalListeners, Vega } from 'react-vega';
import { Result } from 'src/model/core_result';
import { VisualizationSpec } from "../../../node_modules/react-vega/src";
import styles from '../../style/charts.module.css';
import { Redirect } from 'react-router-dom';
import { createRef } from 'react';
import { ChartType, requestChartData, requestPipelines } from '../../controller/web_file_controller';
import { CircularProgress } from '@material-ui/core';
import InterpolationDropdown from '../utils/interpolation_dropdown';
import EventsButtons from '../utils/events_buttons';
import * as RestApi from '../../model/rest_queries';
import BucketsizeDropdwn from '../utils/bucketsize_dropdown';
import PipelinesSelector from '../utils/pipelines_selector';


interface Props {
    appContext: IAppContext;
    resultLoading: model.ResultLoading;
    result: Result | undefined;
    csvParsingFinished: boolean;
    currentChart: string;
    currentEvent: string;
    currentRequest: RestApi.RestQueryType | undefined;
    events: Array<string> | undefined;
    chartIdCounter: number;
    chartData: model.ChartDataKeyValue,
    currentPipeline: Array<string> | undefined,
    currentInterpolation: String,
    currentBucketSize: number,
    setCurrentChart: (newCurrentChart: string) => void;
    setChartIdCounter: (newChartIdCounter: number) => void;

}

interface State {
    chartId: number,
    chartData: IChartData | undefined,
    width: number,
    height: number,
}

interface IChartData {
    buckets: Array<number>,
    operators: Array<string>,
    relativeFrquencies: Array<number>,
}

const startSize = {
    width: 750,
    height: 200,
}

class SwimLanesMultiplePipelines extends React.Component<Props, State> {

    chartWrapper = createRef<HTMLDivElement>();

    constructor(props: Props) {
        super(props);
        this.state = {
            chartId: this.props.chartIdCounter,
            width: startSize.width,
            height: startSize.height,
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
                relativeFrquencies: ((this.props.chartData[this.state.chartId] as model.ChartDataObject).chartData.data as model.ISwimlanesData).relativeFrquencies,
            }

            this.setState((state, props) => {
                return {
                    ...this.state,
                    chartData: chartDataElement,
                }
            });

        }

        //if current event, chart, bucketsize or pipelines change, component did update is executed and queries new data for new event and pipelines selected only if current event and current pipelines already set
        if (this.props.currentEvent && this.props.currentPipeline && (this.props.currentEvent != prevProps.currentEvent || this.props.currentBucketSize != prevProps.currentBucketSize || this.props.chartIdCounter != prevProps.chartIdCounter || this.props.currentPipeline?.length !== prevProps.currentPipeline?.length)) {
            requestChartData(this.props.appContext.controller, this.state.chartId, ChartType.SWIM_LANES_MULTIPLE_PIPELINES, { bucksetsize: "" + this.props.currentBucketSize, pipeline: this.props.currentPipeline?.join() });
        }

    }


    componentDidMount() {
        if (this.props.csvParsingFinished) {
            this.props.setCurrentChart(ChartType.SWIM_LANES_MULTIPLE_PIPELINES);
            requestPipelines(this.props.appContext.controller);

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
        if (!this.chartWrapper) return;

        const child = this.chartWrapper.current;
        if (child) {
            const newWidth = child.clientWidth;
            const newHeight = child.clientHeight;

            child.style.display = 'none';

            this.setState((state, props) => ({
                ...state,
                width: newWidth > startSize.width ? startSize.width : newWidth,
                //height: newHeight,
            }));

            child.style.display = 'block';
        }
    }


    public render() {

        if (!this.props.csvParsingFinished) {
            return <Redirect to={"/upload"} />
        }

        return <div>
            {(this.props.resultLoading[this.state.chartId] || !this.state.chartData || !this.props.events)
                ? <CircularProgress />
                : <div className={"vegaContainer"} ref={this.chartWrapper}>
                    <Vega className={`vegaSwimlaneMultiplePipelines}`} spec={this.createVisualizationSpec()} signalListeners={this.createVegaSignalListeners()} />
                    <PipelinesSelector />
                </div>
            }
        </div>;
    }

    createVegaSignalListeners() {
        const signalListeners: SignalListeners = {
            hover: this.handleVegaHover,
        }
        return signalListeners;
    }

    handleVegaHover(...args: any[]) {
        //TODO remove
    }

    createVisualizationData() {
        console.log(this.state.chartData);

        const data = {
            "name": "table",
            "values": this.state.chartData,
            transform: [
                { "type": "flatten", "fields": ["buckets", "operators", "relativeFrquencies"] },
                { "type": "collect", "sort": { "field": "operators" } },
                { "type": "stack", "groupby": ["buckets"], "field": "relativeFrquencies" }
            ]
        };

        return data;
    }

    createVisualizationSpec() {
        const visData = this.createVisualizationData();

        const xTicks = () => {

            const bucketsArrayLength = this.state.chartData!.buckets.length;
            const numberOfTicks = 30;

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
            width: this.state.width,
            height: this.state.height,
            padding: { left: 10, right: 10, top: 20, bottom: 20 },
            resize: true,
            autosize: 'fit',

            title: {
                text: 'Swim Lanes (variable Pipelines)',
                align: model.chartConfiguration.titleAlign,
                dy: model.chartConfiguration.titlePadding,
            },

            data: [
                visData
            ],

            signals: [
                {
                    name: "hover",
                    description: "A date value that updates in response to mousemove.",
                    on: [{ "events": "area:mouseover", "update": "{}" }]
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
                    labelOverlap: true,
                    values: xTicks(),
                    title: model.chartConfiguration.areaChartXTitle,
                    titlePadding: model.chartConfiguration.axisPadding,
                },
                {
                    orient: "left",
                    scale: "y",
                    zindex: 1,
                    title: model.chartConfiguration.areaChartYTitle,
                    titlePadding: model.chartConfiguration.axisPadding,
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

export default connect(mapStateToProps, mapDispatchToProps)(withAppContext(SwimLanesMultiplePipelines));
