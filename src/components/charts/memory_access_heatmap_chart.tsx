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
import _, { reverse } from "lodash";


interface Props {
    appContext: Context.IAppContext;
    resultLoading: model.ResultLoading;
    result: model.Result | undefined;
    csvParsingFinished: boolean;
    currentChart: string;
    currentEvent: string;
    events: Array<string> | undefined;
    chartIdCounter: number;
    chartData: model.ChartDataKeyValue,
    currentPipeline: Array<string> | "All";
    currentOperator: Array<string> | "All";
    operators: Array<string> | undefined;
    currentBucketSize: number,
    currentTimeBucketSelectionTuple: [number, number],
    setCurrentChart: (newCurrentChart: string) => void;
    setChartIdCounter: (newChartIdCounter: number) => void;
    setCurrentEvent: (newCurrentEvent: string) => void;
}

interface State {
    chartId: number,
}

class MemoryAccessHeatmapChart extends React.Component<Props, State> {

    elementWrapper = createRef<HTMLDivElement>();

    constructor(props: Props) {
        super(props);
        this.state = {
            chartId: this.props.chartIdCounter,
        };
        this.props.setChartIdCounter((this.state.chartId) + 1);

        this.createVisualizationSpec = this.createVisualizationSpec.bind(this);
    }

    componentDidUpdate(prevProps: Props): void {
        this.setDefaultEventToMemLoads(this.props, prevProps);
        this.requestNewChartData(this.props, prevProps);
    }

    setDefaultEventToMemLoads(props: Props, prevProps: Props) {
        console.log(prevProps.chartData[this.state.chartId]);
        //only set bevore first time data requestes and if available memloads are in events and events available
        if (props.events && props.events.includes("mem_inst_retired.all_loads") && !prevProps.chartData[this.state.chartId]) {
            props.setCurrentEvent("mem_inst_retired.all_loads");
        }
    }

    requestNewChartData(props: Props, prevProps: Props): void {
        if (this.newChartDataNeeded(props, prevProps)) {
            Controller.requestChartData(props.appContext.controller, this.state.chartId, model.ChartType.MEMORY_ACCESS_HEATMAP_CHART);
        }
    }

    newChartDataNeeded(props: Props, prevProps: Props): boolean {
        if (props.events &&
            props.operators &&
            (props.chartIdCounter !== prevProps.chartIdCounter ||
                props.currentBucketSize !== prevProps.currentBucketSize ||
                props.currentEvent !== prevProps.currentEvent ||
                !_.isEqual(props.operators, prevProps.operators) ||
                !_.isEqual(props.currentTimeBucketSelectionTuple, prevProps.currentTimeBucketSelectionTuple))) {
            return true;
        } else {
            return false;
        }
    }

    componentDidMount() {

        if (this.props.csvParsingFinished) {

            this.props.setCurrentChart(model.ChartType.MEMORY_ACCESS_HEATMAP_CHART);

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
                    {this.props.operators!.map((elem, index) => (<Vega className={`vegaMemoryHeatmap-${elem}`} key={index} spec={this.createVisualizationSpec(elem)} />))}
                </div>
            }
        </div>;
    }

    createVisualizationData(operator: string) {

        const operatorArray = ((this.props.chartData[this.state.chartId] as model.ChartDataObject).chartData.data as model.IMemoryAccessHeatmapChart).operator;
        const bucketsArray = Array.from(((this.props.chartData[this.state.chartId] as model.ChartDataObject).chartData.data as model.IMemoryAccessHeatmapChart).buckets);
        const memoryAdressArray = Array.from(((this.props.chartData[this.state.chartId] as model.ChartDataObject).chartData.data as model.IMemoryAccessHeatmapChart).memoryAdress);
        const occurrencesArray = Array.from(((this.props.chartData[this.state.chartId] as model.ChartDataObject).chartData.data as model.IMemoryAccessHeatmapChart).occurrences);

        //flatten arrays and filter for needed operator:
        const dataFlattend: Array<{ bucket: number, memAdr: number, occurences: number }> = [];
        operatorArray.forEach((op, index) => {
            if (operator === op) {
                dataFlattend.push({
                    bucket: bucketsArray[index],
                    memAdr: memoryAdressArray[index],
                    occurences: occurrencesArray[index],
                });
            }
        });

        console.log(dataFlattend);

        const data = [
            {
                name: "table",
                values: dataFlattend,
            }

        ]

        return { data, bucketsDomain: bucketsArray, memoryDomain: memoryAdressArray, colorDomain: occurrencesArray };
    }

    createVisualizationSpec(operator: string) {
        const visData = this.createVisualizationData(operator);

        //     const pipelinesLegend = () => {
        //         return this.props.pipelines!.map((elem, index) => (this.props.pipelinesShort![index] + ": " + elem));
        //     }

        const spec: VisualizationSpec = {
            $schema: "https://vega.github.io/schema/vega/v5.json",
            width: 400,
            height: 300,
            padding: { left: 5, right: 5, top: 10, bottom: 10 },
            autosize: { type: "fit", resize: false },

            title: {
                text: `Memory Access Heatmap: ${operator}`,
                align: model.chartConfiguration.titleAlign,
                dy: model.chartConfiguration.titlePadding,
                fontSize: model.chartConfiguration.titleFontSize,
                font: model.chartConfiguration.titleFont,
            },

            // data: visData,
            data: visData.data,

            // [
            //     {
            //         "name": "temperature",
            //         "url": "data/seattle-weather-hourly-normals.csv",
            //         "format": { "type": "csv", "parse": { "temperature": "number", "date": "date" } },
            //         "transform": [
            //             { "type": "formula", "as": "hour", "expr": "hours(datum.date)" },
            //             {
            //                 "type": "formula", "as": "day",
            //                 "expr": "datetime(year(datum.date), month(datum.date), date(datum.date))"
            //             }
            //         ]
            //     }
            // ],

            "scales": [
                {
                    "name": "x",
                    "type": "point",
                    "domain": visData.bucketsDomain,
                    "range": "width"
                },
                {
                    "name": "y",
                    "type": "band",
                    "domain": visData.memoryDomain,
                    "range": "height",
                },
                {
                    "name": "color",
                    "type": "linear",
                    "range": { "scheme": "Viridis" },
                    "domain": visData.colorDomain,
                    "zero": true, "nice": true
                }
            ],

            "axes": [
                {
                    "orient": "bottom",
                    "scale": "x",
                    labelOverlap: true,
                    //values: xTicks(),
                    title: model.chartConfiguration.memoryChartXTitle,
                    titlePadding: model.chartConfiguration.axisPadding,
                    labelFontSize: model.chartConfiguration.axisLabelFontSize,
                    titleFontSize: model.chartConfiguration.axisTitleFontSize,
                    titleFont: model.chartConfiguration.axisTitleFont,
                    labelFont: model.chartConfiguration.axisLabelFont,
                    labelSeparation: model.chartConfiguration.memoryChartXLabelSeparation,
                },
                {
                    orient: "left",
                    scale: "y",
                    zindex: 1,
                    title: model.chartConfiguration.memoryChartYTitle,
                    titlePadding: model.chartConfiguration.axisPadding,
                    labelFontSize: model.chartConfiguration.axisLabelFontSize,
                    labelSeparation: model.chartConfiguration.memoryChartYLabelSeparation,
                    labelOverlap: true,
                    titleFontSize: model.chartConfiguration.axisTitleFontSize,
                    titleFont: model.chartConfiguration.axisTitleFont,
                    labelFont: model.chartConfiguration.axisLabelFont,
                }
            ],

            "marks": [
                {
                    "type": "rect",
                    "from": { "data": "table" },
                    "encode": {
                        "enter": {
                            "x": { "scale": "x", "field": "bucket" },
                            "y": { "scale": "y", "field": "memAdr" },
                            "width": { "value": 5 },
                            "height": { "scale": "y", "band": 1 },
                            //TODO Tooltip
                            //"tooltip": { "signal": "timeFormat(datum.date, '%b %d %I:00 %p') + ': ' + datum.temperature + '°'" }
                        },
                        "update": {
                            "fill": { "scale": "color", "field": "occurences" }
                        }
                    }
                }
            ],

            "legends": [
                {
                    "fill": "color",
                    "type": "gradient",
                    "title": "Number of Accesses",
                    titleFontSize: model.chartConfiguration.legendTitleFontSize,
                    "titlePadding": 4,
                    "gradientLength": { "signal": "height - 20" }
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
    events: state.events,
    chartIdCounter: state.chartIdCounter,
    chartData: state.chartData,
    currentPipeline: state.currentPipeline,
    currentOperator: state.currentOperator,
    operators: state.operators,
    currentTimeBucketSelectionTuple: state.currentTimeBucketSelectionTuple,
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
    setCurrentEvent: (newCurrentEvent: string) => dispatch({
        type: model.StateMutationType.SET_CURRENTEVENT,
        data: newCurrentEvent,
    })
});


export default connect(mapStateToProps, mapDispatchToProps)(Context.withAppContext(MemoryAccessHeatmapChart));
