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
import PipelinesSelector from '../utils/pipelines_selector';
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
}


class SwimLanesCombinedMultiplePipelines extends React.Component<Props, State> {

    elementWrapper = createRef<HTMLDivElement>();

    constructor(props: Props) {
        super(props);
        this.state = {
            chartId: this.props.chartIdCounter,
            width: 0,
        };
        this.props.setChartIdCounter(this.state.chartId + 1);

        this.createVisualizationSpec = this.createVisualizationSpec.bind(this);
    }

    componentDidUpdate(prevProps: Props, prevState: State): void {

        this.requestNewChartData(this.props, prevProps);

    }

    requestNewChartData(props: Props, prevProps: Props): void {
        if (this.newChartDataNeeded(props, prevProps)) {
            if(this,props.absoluteValues){
                Controller.requestChartData(props.appContext.controller, this.state.chartId, model.ChartType.SWIM_LANES_COMBINED_MULTIPLE_PIPELINES_ABSOLUTE);
            }else{
                Controller.requestChartData(props.appContext.controller, this.state.chartId, model.ChartType.SWIM_LANES_COMBINED_MULTIPLE_PIPELINES);
            }
        }
    }

    newChartDataNeeded(props: Props, prevProps: Props): boolean {
        if (prevProps.currentEvent !== "Default" &&
            (props.currentEvent !== prevProps.currentEvent ||
                props.operators !== prevProps.operators ||
                props.currentBucketSize !== prevProps.currentBucketSize ||
                props.chartIdCounter !== prevProps.chartIdCounter ||
                props.currentPipeline.length !== prevProps.currentPipeline.length ||
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

        return <div ref={this.elementWrapper}>
            {this.isComponentLoading()
                ? <Spinner />
                : <div className={"vegaContainer"}>
                    <Vega className={`vegaSwimlaneMultiplePipelines}`} spec={this.createVisualizationSpec()} />
                </div>
            }
        </div>;
    }

    createVisualizationData() {

        const chartDataElement: model.ISwimlanesCombinedData = {
            buckets: ((this.props.chartData[this.state.chartId] as model.ChartDataObject).chartData.data as model.ISwimlanesCombinedData).buckets,
            operators: ((this.props.chartData[this.state.chartId] as model.ChartDataObject).chartData.data as model.ISwimlanesCombinedData).operators,
            frequency: ((this.props.chartData[this.state.chartId] as model.ChartDataObject).chartData.data as model.ISwimlanesCombinedData).frequency,
            bucketsNeg: ((this.props.chartData[this.state.chartId] as model.ChartDataObject).chartData.data as model.ISwimlanesCombinedData).bucketsNeg,
            operatorsNeg: ((this.props.chartData[this.state.chartId] as model.ChartDataObject).chartData.data as model.ISwimlanesCombinedData).operatorsNeg,
            frequencyNeg: ((this.props.chartData[this.state.chartId] as model.ChartDataObject).chartData.data as model.ISwimlanesCombinedData).frequencyNeg,
        }

        const chartDataPos = {
            buckets: chartDataElement.buckets,
            operators: chartDataElement.operators,
            frequency: chartDataElement.frequency,
        }

        const chartDataNeg = {
            buckets: chartDataElement.bucketsNeg,
            operators: chartDataElement.operatorsNeg,
            frequency: chartDataElement.frequencyNeg,
        }

        const data = [{
            name: "tablePos",
            values: chartDataPos,
            transform: [
                { "type": "flatten", "fields": ["buckets", "operators", "frequency"] },
                { "type": "collect", "sort": { "field": "operators" } },
                { "type": "stack", "groupby": ["buckets"], "field": "frequency" }
            ]
        },
        {
            name: "tableNeg",
            values: chartDataNeg,
            transform: [
                { "type": "flatten", "fields": ["buckets", "operators", "frequency"] },
                { "type": "collect", "sort": { "field": "operators" } },
                { "type": "stack", "groupby": ["buckets"], "field": "frequency" }
            ]
        }
        ];

        return { data: data, chartDataElement: chartDataElement };
    }

    createVisualizationSpec() {
        const visData = this.createVisualizationData();

        const xTicks = () => {

            //remove 0 values added to fill up in backend for same sized buckets array as second event to show 
            const bucketsArrayFiltered = visData.chartDataElement.buckets.filter(elem => elem > 0);
            const bucketsArrayFilteredLength = bucketsArrayFiltered.length;
            const numberOfTicks = 20;

            if (bucketsArrayFilteredLength > numberOfTicks) {

                let ticks = [];

                const delta = Math.floor(bucketsArrayFilteredLength / numberOfTicks);

                for (let i = 0; i < bucketsArrayFilteredLength; i = i + delta) {
                    ticks.push(visData.chartDataElement.buckets[i]);
                }
                return ticks;
            }

        }

        const spec: VisualizationSpec = {
            $schema: "https://vega.github.io/schema/vega/v5.json",
            width: this.state.width - 60,
            height: this.state.width / 7,
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

            signals: [
                {
                    name: "currentEvent",
                    value: this.props.currentEvent,
                },
                {
                    name: "upperEvent",
                    value: this.props.events![0],
                }
            ],

            scales: [
                {
                    name: "x",
                    type: "point",
                    range: "width",
                    domain: {
                        fields: [
                            { data: "tablePos", field: "buckets" },
                            { data: "tableNeg", field: "buckets" }
                        ]
                    }
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
                    title: this.props.events![0],
                    titlePadding: model.chartConfiguration.axisPadding,
                    labelFontSize: model.chartConfiguration.axisLabelFontSize,
                    labelSeparation: model.chartConfiguration.areaChartYLabelSeparation,
                    labelOverlap: true,
                    titleFontSize: model.chartConfiguration.axisTitleFontSize,
                    titleFont: model.chartConfiguration.axisTitleFont,
                    labelFont: model.chartConfiguration.axisLabelFont,
                },
                ,
                {
                    orient: "left",
                    scale: "yNeg",
                    zindex: 1,
                    title: this.props.currentEvent,
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
                                        scale: "color",
                                        field: "operators"
                                    },
                                    tooltip: {
                                        signal: `{'Event': upperEvent, ${this.props.absoluteValues ? model.chartConfiguration.areaChartAbsoluteTooltip : model.chartConfiguration.areaChartTooltip}}`,
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
                                        scale: "color",
                                        field: "operators"
                                    },
                                    tooltip: {
                                        signal: `{'Event': currentEvent, ${model.chartConfiguration.areaChartTooltip}}`,
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
    operators: state.operators,
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
