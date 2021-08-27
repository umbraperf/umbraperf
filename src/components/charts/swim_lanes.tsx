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
import { Button, CircularProgress } from '@material-ui/core';
import EventsDropdown from '../events_dropdown';
import InterpolationDropdown from '../interpolation_dropdown';


interface Props {
    appContext: IAppContext;
    resultLoading: boolean;
    result: Result | undefined;
    eventsLoading: boolean;
    events: Array<string> | undefined;
    currentChart: string;
    currentEvent: string;
    setCurrentChart: (newCurrentChart: string) => void;
    setCurrentEvent: (newCurrentEvent: string) => void;
}

interface State {
    width: number,
    height: number,
    interpolation: string;
}

const startSize = {
    width: 750,
    height: 200,
}

const testBuckets = [1, 2, 3, 4, 5];
const testOperatorsGruop = [0, 0, 0.5, 0.4, 0.7];
const testOperatorsJoin = [0, 0.5, 0.1, 0.3, 0];
const testOperatorsTable = [1, 0.5, 0.2, 0, 0];

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
            interpolation: "step",
        };

        this.createVisualizationSpec = this.createVisualizationSpec.bind(this);
        this.handleInterpolationChange = this.handleInterpolationChange.bind(this);
    }

    componentDidUpdate(prevProps: Props): void {
        if (prevProps.result != this.props.result && undefined != this.props.result && !this.props.resultLoading && prevProps.resultLoading != this.props.resultLoading) {
            window.alert("refetch data from rust");
            this.props.appContext.controller.calculateChartData(ChartType.BAR_CHART, this.props.currentEvent);
        }
    }

    componentDidMount() {
        if (this.props.events) {
            this.props.setCurrentChart(ChartType.SWIM_LANES);
            this.props.setCurrentEvent(this.props.events![0]);
            this.props.appContext.controller.calculateChartData(ChartType.SWIM_LANES, this.props.currentEvent, {});
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

    handleEventButtonClick(elem: string){
        this.props.setCurrentEvent(elem);
        this.props.appContext.controller.calculateChartData(ChartType.SWIM_LANES, elem);
    }



    public render() {
        const interpolationDropdownProps = {
            currentInterpolation: this.state.interpolation,
            changeInterpolation: this.handleInterpolationChange,
        }

        if (!this.props.events) {
            return <Redirect to={"/upload"} />
        }

        /*   TODO      if (!this.props.result || this.props.resultLoading) {
                    return <div className={styles.spinnerArea} >
                        <CircularProgress />
                    </div>
                } */

        return <div>
            <div className={styles.resultArea} >
                <div className={styles.optionsArea} >
                    <div className={"eventButtonsArea"}>
                        {this.props.events.map((elem, index) => (
                            <Button
                                className={styles.eventButton}
                                variant="contained"
                                color={this.props.currentEvent === elem ? "primary" : "default"}
                                onClick={() => this.handleEventButtonClick(elem)}
                                style={{ width: 200, borderRadius: 100, margin: 10 }}
                            >
                                {elem}
                            </Button>
                        ))}
                    </div>
                    <div className={styles.dropdownArea} >
                        <InterpolationDropdown {...interpolationDropdownProps}></InterpolationDropdown>
                    </div>
                </div>
                <div className={"vegaContainer"} ref={this.chartWrapper}>
                    {result.map((elem, index) => (<Vega className={`vegaSwimlane${index}`} key={index} spec={this.createVisualizationSpec(index)} />))}
                </div>
            </div>
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
    eventsLoading: state.eventsLoading,
    events: state.events,
    currentChart: state.currentChart,
    currentEvent: state.currentEvent,
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



