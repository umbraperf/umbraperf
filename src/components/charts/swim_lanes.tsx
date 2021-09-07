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
import { ChartType } from '../../controller/web_file_controller';
import { CircularProgress } from '@material-ui/core';
import InterpolationDropdown from '../utils/interpolation_dropdown';
import EventsButtons from '../utils/events_buttons';
import * as SqlApi from '../../model/sql_queries';



interface Props {
    appContext: IAppContext;
    resultLoading: boolean;
    result: Result | undefined;
    csvParsingFinished: boolean;
    currentChart: string;
    currentEvent: string;
    currentRequest: SqlApi.SqlQueryType | undefined;
    setCurrentChart: (newCurrentChart: string) => void;
    setCurrentEvent: (newCurrentEvent: string) => void;

}

interface State {
    events: Array<any> | undefined,
    chartData: undefined | IChartData,
    width: number,
    height: number,
    interpolation: string;
}

interface IChartData {
    operators: Array<string>,
    frequency: Array<number>,
}

const startSize = {
    width: 750,
    height: 200,
}

const testBuckets = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
const testOperatorsGruop = [0, 0, 0.5, 0.4, 0.7, 0.4, 0.3, 0.1, 0, 0];
const testOperatorsJoin = [0, 0.5, 0.1, 0.3, 0, 0, 0, 0.3, 0.5, 0.6];
const testOperatorsTable = [1, 0.5, 0.2, 0, 0, 0.1, 0.4, 0.2, 0, 0.2];

const result = [[
    { x: testBuckets, y: testOperatorsGruop, "c": 0 },
    { x: testBuckets, y: testOperatorsJoin, "c": 1 },
    { x: testBuckets, y: testOperatorsTable, "c": 2 },
], [
    { x: testBuckets, y: testOperatorsGruop, "c": 0 },
    { x: testBuckets, y: testOperatorsJoin, "c": 1 },
    { x: testBuckets, y: testOperatorsTable, "c": 2 },
], [
    { x: testBuckets, y: testOperatorsGruop, "c": 0 },
    { x: testBuckets, y: testOperatorsJoin, "c": 1 },
    { x: testBuckets, y: testOperatorsTable, "c": 2 },
], [
    { x: testBuckets, y: testOperatorsGruop, "c": 0 },
    { x: testBuckets, y: testOperatorsJoin, "c": 1 },
    { x: testBuckets, y: testOperatorsTable, "c": 2 },
]];

const resultorig = [[
    { "x": 0, "y": 28, "c": 0 }, { "x": 0, "y": 55, "c": 1 },
    { "x": 1, "y": 43, "c": 0 }, { "x": 1, "y": 91, "c": 1 },
    { "x": 2, "y": 81, "c": 0 }, { "x": 2, "y": 53, "c": 1 },
    { "x": 3, "y": 19, "c": 0 }, { "x": 3, "y": 87, "c": 1 },
    { "x": 4, "y": 52, "c": 0 }, { "x": 4, "y": 48, "c": 1 },
    { "x": 5, "y": 24, "c": 0 }, { "x": 5, "y": 49, "c": 1 },
    { "x": 6, "y": 87, "c": 0 }, { "x": 6, "y": 66, "c": 1 },
    { "x": 7, "y": 17, "c": 0 }, { "x": 7, "y": 27, "c": 1 },
    { "x": 8, "y": 68, "c": 0 }, { "x": 8, "y": 16, "c": 1 },
    { "x": 9, "y": 49, "c": 0 }, { "x": 9, "y": 15, "c": 1 }
], [
    { "x": 0, "y": 28, "c": 3 }, { "x": 0, "y": 55, "c": 4 },
    { "x": 1, "y": 43, "c": 3 }, { "x": 1, "y": 91, "c": 4 },
    { "x": 2, "y": 81, "c": 3 }, { "x": 2, "y": 53, "c": 4 },
    { "x": 3, "y": 19, "c": 3 }, { "x": 3, "y": 87, "c": 4 },
    { "x": 4, "y": 52, "c": 3 }, { "x": 4, "y": 48, "c": 4 },
    { "x": 5, "y": 24, "c": 3 }, { "x": 5, "y": 49, "c": 4 },
    { "x": 6, "y": 87, "c": 3 }, { "x": 6, "y": 66, "c": 4 },
    { "x": 7, "y": 17, "c": 3 }, { "x": 7, "y": 27, "c": 4 },
    { "x": 8, "y": 68, "c": 3 }, { "x": 8, "y": 16, "c": 4 },
    { "x": 100, "y": 49, "c": 3 }, { "x": 9, "y": 15, "c": 4 }
], [
    { "x": 0, "y": 28, "c": 5 }, { "x": 0, "y": 55, "c": 6 },
    { "x": 1, "y": 43, "c": 5 }, { "x": 1, "y": 91, "c": 6 },
    { "x": 2, "y": 81, "c": 5 }, { "x": 2, "y": 53, "c": 6 },
    { "x": 3, "y": 19, "c": 5 }, { "x": 3, "y": 87, "c": 6 },
    { "x": 4, "y": 52, "c": 5 }, { "x": 4, "y": 48, "c": 6 },
    { "x": 5, "y": 24, "c": 5 }, { "x": 5, "y": 49, "c": 6 },
    { "x": 6, "y": 87, "c": 5 }, { "x": 6, "y": 66, "c": 6 },
    { "x": 7, "y": 17, "c": 5 }, { "x": 7, "y": 27, "c": 6 },
    { "x": 8, "y": 68, "c": 5 }, { "x": 8, "y": 16, "c": 6 },
    { "x": 9, "y": 49, "c": 5 }, { "x": 9, "y": 15, "c": 6 }
]];

class SwimLanes extends React.Component<Props, State> {

    chartWrapper = createRef<HTMLDivElement>();

    constructor(props: Props) {
        super(props);
        this.state = {
            width: startSize.width,
            height: startSize.height,
            events: undefined,
            chartData: undefined,
            interpolation: "basis",
        };

        this.createVisualizationSpec = this.createVisualizationSpec.bind(this);
        this.handleInterpolationChange = this.handleInterpolationChange.bind(this);
    }

    componentDidUpdate(prevProps: Props): void {
        console.log(prevProps);
        console.log(this.props);

        //ensure changed app state and only proceed when result available
        if (prevProps.result != this.props.result && undefined != this.props.result && !this.props.resultLoading && this.props.csvParsingFinished) {

            //if type of current request is GET_EVENTS, then store result from rust in component state event property 
            if (this.props.currentRequest === SqlApi.SqlQueryType.GET_EVENTS) {
                const events = this.props.result!.resultTable.getColumn('ev_name').toArray();
                const currentEvent = events[0];
                this.setState((state, props) => ({
                    ...state,
                    events: events,
                }));

                //Set first event as current, triggers component did update and calculates chart data for first event as default
                this.props.setCurrentEvent(currentEvent);
            }

            //store resulting chart data from rust when type of query was get_operator_frequency_per_event, only if result not undefined / parsing finished / result not loading / new result 
            if (this.props.currentRequest === SqlApi.SqlQueryType.GET_OPERATOR_FREQUENCY_PER_EVENT) {
                /*                         const operators = this.props.result!.resultTable.getColumn('operator').toArray();
                                        const frequency = this.props.result!.resultTable.getColumn('count').toArray();
                                        this.setState((state, props) => ({
                                            ...state,
                                            chartData: {
                                                operators: operators,
                                                frequency: frequency,
                                            },
                                        })); */
            }
        }

        //if current event changes, component did update is executed and queries new data for new event
        if (this.props.currentEvent != prevProps.currentEvent) {
            /* this.props.appContext.controller.calculateChartData(
                SqlApi.SqlQueryType.GET_OPERATOR_FREQUENCY_PER_EVENT,
                SqlApi.createSqlQuery({
                    type: SqlApi.SqlQueryType.GET_OPERATOR_FREQUENCY_PER_EVENT,
                    data: { event: this.props.currentEvent },
                })); */
        }

    }


    componentDidMount() {
        if (this.props.csvParsingFinished) {
            this.props.setCurrentChart(ChartType.SWIM_LANES);
            this.props.appContext.controller.calculateChartData(
                SqlApi.SqlQueryType.GET_EVENTS,
                SqlApi.createSqlQuery({
                    type: SqlApi.SqlQueryType.GET_EVENTS,
                    data: {},
                }));

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

    handleInterpolationChange(newInterpolation: string) {
        this.setState({
            ...this.state,
            interpolation: newInterpolation,
        });
    }


    public render() {

        const interpolationDropdownProps = {
            currentInterpolation: this.state.interpolation,
            changeInterpolation: this.handleInterpolationChange,
        }

        if (!this.props.csvParsingFinished) {
            return <Redirect to={"/upload"} />
        }

        if (!this.state.events) {
            return <div className={styles.spinnerArea} >
                <CircularProgress />
            </div>
        }

        return <div>
            {this.state.events &&
                <div className={styles.resultArea} >
                    <div className={styles.optionsArea} >
                        <EventsButtons events={this.state.events}></EventsButtons>
                        <div className={styles.dropdownArea} >
                            <InterpolationDropdown {...interpolationDropdownProps}></InterpolationDropdown>
                        </div>
                    </div>
                    {/* (!this.state.chartData || !this.props.result || this.props.resultLoading)
                        ? <CircularProgress />
                        : */ <div className={"vegaContainer"} ref={this.chartWrapper}>
                            {result.map((elem, index) => (<Vega className={`vegaSwimlane${index}`} key={index} spec={this.createVisualizationSpec(index)} />))}
                        </div>
                    }
                </div>
            }
        </div>;
    }

    createVisualizationData(chartId: number) {
        const data = {
            "name": "table",
            "values": result[chartId],
            "transform": [
                {
                    type: "flatten",
                    fields: ["x", "y"]
                },
                {
                    "type": "stack",
                    "groupby": ["x"],
                    "sort": { "field": "c" },
                    "field": "y"
                }
            ]
        };

        return data;
    }

    createVisualizationSpec(chartId: number) {
        const visData = this.createVisualizationData(chartId);

        const spec: VisualizationSpec = {
            $schema: "https://vega.github.io/schema/vega/v5.json",
            width: this.state.width,
            height: this.state.height,
            padding: { left: 10, right: 10, top: 20, bottom: 20 },
            resize: true,
            autosize: 'fit',

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
                        field: "x"
                    }
                },
                {
                    name: "y",
                    type: "linear",
                    range: "height",
                    nice: true,
                    zero: true,
                    domain: {
                        data: "table",
                        field: "y1"
                    }
                },
                {
                    name: "color",
                    type: "ordinal",
                    range: {
                        scheme: "tableau20",
                    },
                    domain: {
                        data: "table",
                        field: "c"
                    }
                }
            ],
            axes: [
                {
                    orient: "bottom",
                    scale: "x",
                    zindex: 1
                },
                {
                    orient: "left",
                    scale: "y",
                    zindex: 1
                }
            ],
            marks: [
                {
                    type: "group",
                    from: {
                        facet: {
                            name: "series",
                            data: "table",
                            groupby: "c"
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
                                        value: this.state.interpolation,
                                    },
                                    x: {
                                        scale: "x",
                                        field: "x"
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
                                        field: "c"
                                    }
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
});


export default connect(mapStateToProps, mapDispatchToProps)(withAppContext(SwimLanes));



