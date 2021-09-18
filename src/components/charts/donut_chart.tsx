import * as model from '../../model';
import React from 'react';
import { connect } from 'react-redux';
import { IAppContext, withAppContext } from '../../app_context';
import { SignalListeners, Vega } from 'react-vega';
import { Result } from 'src/model/core_result';
import { VisualizationSpec } from "react-vega/src";
import styles from '../../style/charts.module.css';
import { Redirect } from 'react-router-dom';
import { createRef } from 'react';
import { CircularProgress } from '@material-ui/core';
import { ChartType } from '../../controller/web_file_controller';
import EventsButtons from '../utils/events_buttons';
import * as RestApi from '../../model/rest_queries';
import { requestChartData } from '../../controller/web_file_controller'

interface Props {
    appContext: IAppContext;
    resultLoading: boolean;
    result: Result | undefined;
    csvParsingFinished: boolean;
    currentChart: string;
    currentEvent: string;
    currentRequest: RestApi.RestQueryType | undefined;
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

const startSize = {
    width: 200,
    height: window.innerHeight > 1000 ? 500 : window.innerHeight - 350,
}

class DonutChart extends React.Component<Props, State> {

    chartWrapper = createRef<HTMLDivElement>();

    constructor(props: Props) {
        super(props);
        this.state = {
            chartId: this.props.chartIdCounter,
            width: startSize.width,
            height: startSize.height,
        };
        this.props.setChartIdCounter((this.state.chartId) + 1);

        this.createVisualizationSpec = this.createVisualizationSpec.bind(this);
    }

    componentDidUpdate(prevProps: Props): void {

        //if current event changes, component did update is executed and queries new data for new event
        if (this.props.currentEvent != prevProps.currentEvent) {
            requestChartData(this.props.appContext.controller, this.state.chartId, ChartType.DONUT_CHART);
        }

    }

    componentDidMount() {
        if (this.props.csvParsingFinished) {
            this.props.setCurrentChart(ChartType.BAR_CHART);

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
                width: newWidth > startSize.width ? startSize.width : newWidth,
                height: newHeight > startSize.height ? startSize.height : newHeight,
            }));

            child.style.display = 'block';
        }


    }


    public render() {

        if (!this.props.csvParsingFinished) {
            return <Redirect to={"/upload"} />
        }

        return <div>
            <div className={styles.resultArea} >
                <div className={styles.optionsArea} >
                    <EventsButtons />
                </div>
                {(this.props.resultLoading || !this.props.chartData[this.state.chartId] || !this.props.events)
                    ? <CircularProgress />
                    : <div className={"vegaContainer"} ref={this.chartWrapper}>
                        <Vega spec={this.createVisualizationSpec()} signalListeners={this.createVegaSignalListeners()} />
                    </div>
                }

            </div>
        </div>;
    }

    createVegaSignalListeners(){
        const signalListeners: SignalListeners = {
            clickPipeline: this.handleCklickPipeline,
        }
        return signalListeners;
    }

    handleCklickPipeline(...args: any[]){
        console.log(args);
    }

    createVisualizationData() {

        console.log(this.props.chartData);

        const pipelinesArray = ((this.props.chartData[this.state.chartId] as model.ChartDataObject).chartData.data as model.IDonutChartData).pipeline;
        const countArray = ((this.props.chartData[this.state.chartId] as model.ChartDataObject).chartData.data as model.IDonutChartData).count;

        let dataArray: { pipeline: string; value: number; }[] = [];
        pipelinesArray.forEach((elem, index) => {
           const dataObject = {pipeline: elem, value: countArray[index]};
           dataArray.push(dataObject);
        });

        const data = {
            name: "table",
            values: dataArray,
            transform: [
                {
                    type: "formula",
                    expr: "datum.pipeline + ': ' + datum.value",
                    as: "tooltip"
                },
                {
                    type: "pie",
                    field: "value",
                    startAngle: 0,
                    endAngle: 6.29,
                    sort: true
                }
            ]
        }


        return data;
    }

    createVisualizationSpec() {
        const visData = this.createVisualizationData();

        const spec: VisualizationSpec = {
            $schema: "https://vega.github.io/schema/vega/v5.json",
            width: this.state.width,
            height: this.state.height,
            padding: { left: 5, right: 5, top: 5, bottom: 5 },
            resize: true,
            autosize: 'fit',

            data: [
                visData
            ],

            signals: [
                {
                  name: "clickPipeline",
                  on: [
                    {events: "arc:click", update: "datum"}
                  ]
                }
              ],

            scales: [
                {
                    "name": "color",
                    "type": "ordinal",
                    "domain": { "data": "table", "field": "pipeline" },
                    "range": { "scheme": "category20c" }
                }
            ],

            marks: [
                {
                    "type": "arc",
                    "from": { "data": "table" },
                    "encode": {
                        "enter": {
                            "fill": { "scale": "color", "field": "pipeline" },
                            "x": { "signal": "width / 2" },
                            "y": { "signal": "height / 2" },
                            "startAngle": { "field": "startAngle" },
                            "endAngle": { "field": "endAngle" },
                            "innerRadius": { "value": 60 },
                            "outerRadius": { "signal": "width / 2" },
                            "cornerRadius": { "value": 0 },
                            "tooltip": { "field": "tooltip" }
                        }
                    }
                }
            ]
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


export default connect(mapStateToProps, mapDispatchToProps)(withAppContext(DonutChart));
