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
import { Button, CircularProgress, Color } from '@material-ui/core';
import { ChartType } from '../../controller/web_file_controller';
import EventsDropdown from '../events_dropdown';



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
}

const startSize = {
    width: 500,
    height: 500,
}

class BarChart extends React.Component<Props, State> {

    chartWrapper = createRef<HTMLDivElement>();

    constructor(props: Props) {
        super(props);
        this.state = {
            width: startSize.width,
            height: startSize.height,
        };

        this.createVisualizationSpec = this.createVisualizationSpec.bind(this);
    }

    componentDidUpdate(prevProps: Props): void {
        if (prevProps.result != this.props.result && undefined != this.props.result && !this.props.resultLoading && prevProps.resultLoading != this.props.resultLoading) {
            window.alert("refetch data from rust");
            this.props.appContext.controller.calculateChartData(ChartType.BAR_CHART, this.props.currentEvent);
        }
    }

    componentDidMount() {
        if(this.props.events){
            this.props.setCurrentChart(ChartType.BAR_CHART);
            this.props.setCurrentEvent(this.props.events![0]);
            this.props.appContext.controller.calculateChartData(ChartType.BAR_CHART, this.props.currentEvent);
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

    handleEventButtonClick(elem: string){
        this.props.setCurrentEvent(elem);
        this.props.appContext.controller.calculateChartData(ChartType.BAR_CHART, elem);
    }


    public render() {

        if (!this.props.events) {
            return <Redirect to={"/upload"} />
        }

        if (!this.props.result || this.props.resultLoading) {
            return <div className={styles.spinnerArea} >
                <CircularProgress />
            </div>
        }

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
                </div>
                <div className={"vegaContainer"} ref={this.chartWrapper}>
                    <Vega spec={this.createVisualizationSpec()} />
                </div>
            </div>
        </div>;
    }

    createVisualizationData() {

        const operatorsArray = this.props.result?.resultTable.getColumn("operator").toArray();
        console.log(operatorsArray);
        const valueArray = this.props.result?.resultTable.getColumn("cycles").toArray();
        console.log(valueArray);

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
                            fill: { value: 'steelblue' },
                        },
                        hover: {
                            fill: { value: 'red' },
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


export default connect(mapStateToProps, mapDispatchToProps)(withAppContext(BarChart));



