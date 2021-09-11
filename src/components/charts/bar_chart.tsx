import * as model from '../../model';
import React from 'react';
import { connect } from 'react-redux';
import { IAppContext, withAppContext } from '../../app_context';
import { Vega } from 'react-vega';
import { Result } from 'src/model/core_result';
import { VisualizationSpec } from "../../../node_modules/react-vega/src";
import styles from '../../style/charts.module.css';
import { Redirect } from 'react-router-dom';
import { createRef } from 'react';
import { CircularProgress } from '@material-ui/core';
import { ChartType } from '../../controller/web_file_controller';
import EventsButtons from '../utils/events_buttons';
import * as SqlApi from '../../model/sql_queries';
import {requestEvents, createRequestForRust} from '../../controller/web_file_controller'

interface Props {
    appContext: IAppContext;
    resultLoading: boolean;
    result: Result | undefined;
    csvParsingFinished: boolean;
    currentChart: string;
    currentEvent: string;
    currentRequest: SqlApi.SqlQueryType | undefined;
    events: Array<string> | undefined;
    chartIdCounter: number;
    setCurrentChart: (newCurrentChart: string) => void;
    setCurrentEvent: (newCurrentEvent: string) => void;
    setChartIdCounter: (newChartIdCounter: number) => void;

}

interface State {
    chartId: number,
    chartData: undefined | IChartData,
    width: number,
    height: number,
}

interface IChartData {
    operators: Array<string>,
    frequency: Array<number>,
}

const startSize = {
    width: 500,
    height: window.innerHeight>1000 ? 500 : window.innerHeight - 350,
}

class BarChart extends React.Component<Props, State> {

    chartWrapper = createRef<HTMLDivElement>();

    constructor(props: Props) {
        super(props);
        this.state = {
            chartId: this.props.chartIdCounter,
            chartData: undefined,
            width: startSize.width,
            height: startSize.height,
        };
        this.props.setChartIdCounter((this.state.chartId) + 1);

        this.createVisualizationSpec = this.createVisualizationSpec.bind(this);
    }

    componentDidUpdate(prevProps: Props): void {

        //ensure changed app state and only proceed when result available
        if (prevProps.result != this.props.result && undefined != this.props.result && !this.props.resultLoading && this.props.csvParsingFinished) {

            //store resulting chart data from rust when type of query was get_operator_frequency_per_event, only if result not undefined / parsing finished / result not loading / new result 
            if (this.props.currentRequest === SqlApi.SqlQueryType.GET_OPERATOR_FREQUENCY_PER_EVENT) {
                const operators = this.props.result!.resultTable.getColumn('operator').toArray();
                const frequency = this.props.result!.resultTable.getColumn('count').toArray();
                this.setState((state, props) => ({
                    ...state,
                    chartData: {
                        operators: operators,
                        frequency: frequency,
                    },
                }));
            }
        }

        //if current event changes, component did update is executed and queries new data for new event
        if (this.props.currentEvent != prevProps.currentEvent) {
            createRequestForRust(this.props.appContext.controller, this.state.chartId, ChartType.BAR_CHART);
        }

    }

    componentDidMount() {
        if (this.props.csvParsingFinished) {
            this.props.setCurrentChart(ChartType.BAR_CHART);
            requestEvents(this.props.appContext.controller);

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
                height: newHeight > startSize.height ? startSize.height : newHeight,
            }));

            child.style.display = 'block';
        }


    }


    public render() {
        console.log(this.state.chartData);

        if (!this.props.csvParsingFinished) {
            return <Redirect to={"/upload"} />
        }

        if (!this.props.events) {
            return <div className={styles.spinnerArea} >
                <CircularProgress />
            </div>
        }

        return <div>
            {this.props.events &&
                <div className={styles.resultArea} >
                    <div className={styles.optionsArea} >
                        <EventsButtons events={this.props.events}></EventsButtons>
                    </div>
                    {(!this.state.chartData || !this.props.result || this.props.resultLoading)
                        ? <CircularProgress />
                        : <div className={"vegaContainer"} ref={this.chartWrapper}>
                            <Vega spec={this.createVisualizationSpec()} />
                        </div>
                    }

                </div>
            }
        </div>;
    }

    createVisualizationData() {

        const operatorsArray = this.state.chartData?.operators;
        const valueArray = this.state.chartData?.frequency;

        const data = {

            transform: [{ type: "flatten", fields: ["operators", "values"] }],
            name: "table",
            values: [
                { operators: operatorsArray, values: valueArray }
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

            data: [
                visData,
            ],

            signals: [
                {
                    name: 'tooltip',
                    value: {},
                    on: [
                        { events: 'rect:mouseover', update: 'datum' },
                        { events: 'rect:mouseout', update: '{}' },
                    ],
                },
            ],

            scales: [
                {
                    name: 'xscale',
                    type: 'band',
                    domain: { data: 'table', field: 'operators' },
                    range: 'width',
                },
                {
                    name: 'yscale',
                    domain: { data: 'table', field: 'values' },
                    nice: true,
                    range: 'height',
                },
            ],

            axes: [
                { orient: 'bottom', scale: 'xscale' },
                { orient: 'left', scale: 'yscale' },
            ],

            marks: [
                {
                    type: 'rect',
                    from: { data: 'table' },
                    encode: {
                        enter: {
                            x: { scale: 'xscale', field: 'operators', offset: 1 },
                            width: { scale: 'xscale', band: 1, offset: -1 },
                            y: { scale: 'yscale', field: 'values' },
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
                    type: 'text',
                    encode: {
                        enter: {
                            align: { value: 'center' },
                            baseline: { value: 'bottom' },
                            fill: { value: '#333' },
                        },
                        update: {
                            x: { scale: 'xscale', signal: 'tooltip.operators', band: 0.5 },
                            y: { scale: 'yscale', signal: 'tooltip.values', offset: -2 },
                            text: { signal: 'tooltip.values' },
                            fillOpacity: [{ test: 'datum === tooltip', value: 0 }, { value: 1 }],
                        },
                    },
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
});

const mapDispatchToProps = (dispatch: model.Dispatch) => ({
    setCurrentChart: (newCurrentChart: string) => dispatch({
        type: model.StateMutationType.SET_CURRENTCHART,
        data: newCurrentChart,
    }),
    setCurrentEvent: (newCurrentEvent: string) => dispatch({
        type: model.StateMutationType.SET_CURRENTEVENT,
        data: newCurrentEvent,
    }),
    setChartIdCounter: (newChartIdCounter: number) => dispatch({
        type: model.StateMutationType.SET_CHARTIDCOUNTER,
        data: newChartIdCounter,
    }),
});


export default connect(mapStateToProps, mapDispatchToProps)(withAppContext(BarChart));
