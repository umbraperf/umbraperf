import * as model from '../../model';
import * as Controller from '../../controller/request_controller';
import * as Context from '../../app_context';
import React from 'react';
import { connect } from 'react-redux';
import { Vega } from 'react-vega';
import { VisualizationSpec } from "../../../node_modules/react-vega/src";
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
    setCurrentChart: (newCurrentChart: string) => void;
    setChartIdCounter: (newChartIdCounter: number) => void;

}

interface State {
    chartId: number,
    width: number,
    height: number,
}


class BarChartActivityHistogram extends React.Component<Props, State> {

    chartWrapper = createRef<HTMLDivElement>();
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
    }

    componentDidUpdate(prevProps: Props): void {

        //if current event or chart change, component did update is executed and queries new data for new event selected only if current event already set
        if (this.props.currentEvent && (this.props.currentEvent != prevProps.currentEvent || this.props.chartIdCounter != prevProps.chartIdCounter)) {
            Controller.requestChartData(this.props.appContext.controller, this.state.chartId, model.ChartType.BAR_CHART_ACTIVITY_HISTOGRAM);
        }

    }

    componentDidMount() {

        this.setState((state, props) => ({
            ...state,
            // remove 38 from chart size as it is 38px bigger because of summary button
            width: this.elementWrapper.current!.offsetWidth - 38,
            height: 300,
        }));

        if (this.props.csvParsingFinished) {
            this.props.setCurrentChart(model.ChartType.BAR_CHART_ACTIVITY_HISTOGRAM);

            addEventListener('resize', (event) => {
                this.resizeListener();
            });
        }
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
                width: newWidth,
                height: newHeight > 300 ? this.state.height : child.clientHeight,
            }));

            child.style.display = 'block';
        }


    }


    public render() {

        if (!this.props.csvParsingFinished) {
            return <Redirect to={"/upload"} />
        }

        return <div ref={this.elementWrapper}>
            {(this.props.resultLoading[this.state.chartId] || !this.props.chartData[this.state.chartId] || !this.props.events)
                ? <CircularProgress />
                : <div className={"vegaContainer"} ref={this.chartWrapper}>
                    <Vega spec={this.createVisualizationSpec()} />
                </div>
            }
        </div>;
    }

    createVisualizationData() {

        console.log(this.props.chartData);

        const timeBucketsArray = ((this.props.chartData[this.state.chartId] as model.ChartDataObject).chartData.data as model.IBarChartActivityHistogramData).timeBucket;
        const occurrencesArray = ((this.props.chartData[this.state.chartId] as model.ChartDataObject).chartData.data as model.IBarChartActivityHistogramData).occurrences;

        const data = {

            transform: [{ type: "flatten", fields: ["timeBuckets", "occurrences"] }],
            name: "table",
            values: [
                { timeBuckets: timeBucketsArray, occurrences: occurrencesArray }
            ]
        };


        return data;
    }

    createVisualizationSpec() {
        const visData = this.createVisualizationData();

        const spec: VisualizationSpec = {
            $schema: 'https://vega.github.io/schema/vega/v5.json',
            width: this.state.width,
            height: this.state.height,
            padding: { left: 5, right: 5, top: 5, bottom: 5 },
            resize: true,
            autosize: 'fit',
            title: {
                text: "Absolute Activity per Event over Time of Query Execution",
                align: model.chartConfiguration.titleAlign,
                dy: model.chartConfiguration.titlePadding,
            },

            data: [
                visData,
            ],

            scales: [
                {
                    name: 'xscale',
                    type: 'band',
                    domain: { data: 'table', field: 'timeBuckets' },
                    range: 'width',
                },
                {
                    name: 'yscale',
                    domain: { data: 'table', field: 'occurrences' },
                    nice: true,
                    range: 'height',
                },
            ],

            axes: [
                {
                    orient: 'bottom',
                    scale: 'xscale',
                    labelOverlap: false,
                    title: "Execution Time",
                    titlePadding: model.chartConfiguration.axisPadding,
                    encode: {
                        labels: {
                            update: {
                                angle: { value: -70 },
                                align: { value: "right" }
                            }
                        }
                    }
                },
                /*                 {
                                    orient: 'left',
                                    titlePadding: model.chartConfiguration.axisPadding,
                                    scale: 'yscale',
                                    title: "Event Occurrences",
                                    labelOverlap: false,
                                }, */
            ],

            marks: [
                {
                    name: 'bars',
                    type: 'rect',
                    from: { data: 'table' },
                    encode: {
                        enter: {
                            x: { scale: 'xscale', field: 'timeBuckets', offset: 1 },
                            width: { scale: 'xscale', band: 1, offset: -1 },
                            y: { scale: 'yscale', field: 'occurrences' },
                            y2: { scale: 'yscale', value: 0 },
                        },
                        update: {
                            fill: { value: this.props.appContext.secondaryColor },
                        },
                        hover: {
                            fill: { value: this.props.appContext.primaryColor },
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
                            fill: [
                                { test: "contrast('white', datum.fill) > contrast('black', datum.fill)", "value": "white" },
                                { value: "black" }
                            ],
                            align: { value: "center" },
                            baseline: { value: "middle" },
                            text: { field: "datum.occurrences" }
                        }
                    }
                },
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


export default connect(mapStateToProps, mapDispatchToProps)(Context.withAppContext(BarChartActivityHistogram));