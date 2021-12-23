import * as model from '../../model';
import * as Controller from '../../controller';
import * as Context from '../../app_context';
import styles from '../../style/charts.module.css';
import Spinner from '../utils/spinner/spinner';
import React from 'react';
import { connect, ConnectedProps } from 'react-redux';
import { Redirect } from 'react-router-dom';
import { createRef } from 'react';
import _ from "lodash";

import HeatmapsDiffToggler from '../utils/togglers/heatmaps_difference_toggler';
import SunburstChart from './vega_visualizations/sunburst_chart';
import BarChart from './vega_visualizations/bar_chart';
import BarChartActivityHistogram from './vega_visualizations/bar_chart_activity_histogram';
import SwimLanesMultiplePipelines from './vega_visualizations/swim_lanes_multiple_pipelines';
import SwimLanesCombinedMultiplePipelines from './vega_visualizations/swim_lanes_combined_multiple_pipelines';
import MemoryAccessHeatmapChart from './vega_visualizations/memory_access_heatmap_chart';
import UirViewer from './uir/uir_viewer';
import QueryPlan from './queryplan/query_plan_wrapper';


interface OwnProps {
    chartType: model.ChartType;
}

export interface ChartWrapperAppstateProps {
    appContext: Context.IAppContext;
    chartIdCounter: number;
    umbraperfFileParsingFinished: boolean;
    resultLoading: model.IResultLoading;
    chartData: model.IChartDataKeyValue,
    events: Array<string> | undefined;
    pipelines: Array<string> | undefined;
    operators: model.IOperatorsData | undefined;
    currentEvent: string;
    currentMultipleEvent: [string, string] | "Default";
    currentOperator: Array<string> | "All",
    currentPipeline: Array<string> | "All",
    currentView: model.ViewType;
    currentTimeBucketSelectionTuple: [number, number],
    currentMemoryAddressSelectionTuple: [number, number],
    currentBucketSize: number,
    memoryHeatmapsDifferenceRepresentation: boolean,

    setChartIdCounter: (newChartIdCounter: number) => void;
    setCurrentChart: (newCurrentChart: model.ChartType) => void;
}

type Props = OwnProps & ChartWrapperAppstateProps;

interface State {
    chartId: number,
    width: number,
    height: number,
}

let globalInputDataChanged: { [chartId: number]: boolean };

class ChartWrapper extends React.Component<Props, State> {

    elementWrapper = createRef<HTMLDivElement>();

    constructor(props: Props) {
        super(props);
        this.state = {
            chartId: this.props.chartIdCounter,
            width: 0,
            height: 0,
        };
        globalInputDataChanged = {
            ...globalInputDataChanged,
            [this.props.chartIdCounter]: false,
        };
        this.props.setChartIdCounter((this.state.chartId) + 1);
    }

    shouldComponentUpdate(nextProps: Props, nextState: State) {

        globalInputDataChanged[this.state.chartId] = false;

        //rerender only on affected input data changed and if they are available, store if this is the case to avoid checking the condition to fetch the data later twice
        if (Controller.chartRerenderNeeded(nextProps, this.props, this.props.chartType)) {
            globalInputDataChanged[this.state.chartId] = true;
            return true;
        }

        //rerender on changed loading state, no rerender on different chart changes loading state!
        if (this.props.resultLoading[this.state.chartId] !== nextProps.resultLoading[this.state.chartId]) {
            return true;
        } else if (!_.isEqual(this.props.resultLoading, nextProps.resultLoading)) {
            return false;
        }

        //rerender on changed size
        if (this.state.width !== nextState.width || this.state.height !== nextState.height) {
            return true;
        }

        //do not rerender in all other cases 
        return false;
    }


    componentDidMount() {

        this.setState((state, props) => ({
            ...state,
            width: this.elementWrapper.current!.offsetWidth,
            height: this.elementWrapper.current!.offsetHeight,
        }));

        if (this.props.umbraperfFileParsingFinished) {

            addEventListener('resize', (event) => {
                this.resizeListener();
            });
        }
    }


    componentDidUpdate(prevProps: Props): void {
        //Controller.newChartDataNeeded(this.props, prevProps, this.props.chartType, this.state.chartId);
        if (globalInputDataChanged[this.state.chartId] === true) {
            Controller.requestChartData(this.props.appContext.controller, this.state.chartId, this.props.chartType);
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
            const newHeight = child.offsetHeight;

            if (newWidth !== this.state.width || newHeight !== this.state.height) {
                child.style.display = 'none';

                this.setState((state, props) => ({
                    ...state,
                    width: newWidth,
                    height: newHeight,
                }));

                child.style.display = 'flex';
            }
        }
    }

    createChildChart() {

        const partialChartProps: model.ICommonChartProps = {
            key: this.state.chartId + this.state.width + this.state.height,
            chartId: this.state.chartId,
            width: this.state.width,
            chartType: this.props.chartType,
        }

        let specificChart: model.ChartComponentVariant = {} as model.ChartComponentVariant;
        let chartClass: React.ElementType | undefined = undefined;

        switch (this.props.chartType) {

            case model.ChartType.BAR_CHART_ACTIVITY_HISTOGRAM:
                const barChartActivityHistogramProps: model.IBarChartActivityHistogramProps = {
                    ...partialChartProps,
                };
                specificChart = {
                    type: this.props.chartType,
                    props: barChartActivityHistogramProps,
                };
                chartClass = BarChartActivityHistogram;
                break;

            case model.ChartType.BAR_CHART:
                const barChartProps: model.IBarChartProps = {
                    ...partialChartProps,
                    onDashboard: true,
                    height: this.state.height,
                };
                specificChart = {
                    type: this.props.chartType,
                    props: barChartProps,
                };
                chartClass = BarChart;
                break;

            case model.ChartType.SUNBURST_CHART:
                const sunburstProps: model.ISunburstChartProps = {
                    ...partialChartProps,
                    height: this.state.height,
                    doubleRowSize: this.state.height > 400 ? true : false,
                };
                specificChart = {
                    type: this.props.chartType,
                    props: sunburstProps,
                };
                chartClass = SunburstChart;
                break;

            case model.ChartType.SWIM_LANES_MULTIPLE_PIPELINES:
                const swimLanesMultiplePipelinesProps: model.ISwimlanesProps = {
                    ...partialChartProps,
                    height: this.state.height,
                    absoluteValues: false,
                };
                specificChart = {
                    type: this.props.chartType,
                    props: swimLanesMultiplePipelinesProps,
                };
                chartClass = SwimLanesMultiplePipelines;
                break;

            case model.ChartType.SWIM_LANES_MULTIPLE_PIPELINES_ABSOLUTE:
                const swimLanesMultiplePipelinesAbsoluteProps: model.ISwimlanesProps = {
                    ...partialChartProps,
                    height: this.state.height,
                    absoluteValues: true,
                };
                specificChart = {
                    type: this.props.chartType,
                    props: swimLanesMultiplePipelinesAbsoluteProps,
                };
                chartClass = SwimLanesMultiplePipelines;
                break;

            case model.ChartType.SWIM_LANES_COMBINED_MULTIPLE_PIPELINES_ABSOLUTE:
                const swimLanesCombinedMultiplePipelinesAbsoluteProps: model.ISwimlanesProps = {
                    ...partialChartProps,
                    height: this.state.height,
                    absoluteValues: true,
                };
                specificChart = {
                    type: this.props.chartType,
                    props: swimLanesCombinedMultiplePipelinesAbsoluteProps,
                };
                chartClass = SwimLanesCombinedMultiplePipelines;
                break;

            case model.ChartType.MEMORY_ACCESS_HEATMAP_CHART:
                const memoryAccessHeatmapChartProps: model.IMemoryAccessHeatmapChartProps = {
                    ...partialChartProps,
                };
                specificChart = {
                    type: this.props.chartType,
                    props: memoryAccessHeatmapChartProps,
                };
                chartClass = MemoryAccessHeatmapChart;
                break;

            case model.ChartType.UIR_VIEWER:
                const uirViewerChartProps: model.IUirViewerProps = {
                    ...partialChartProps,
                };
                specificChart = {
                    type: this.props.chartType,
                    props: uirViewerChartProps,
                };
                chartClass = UirViewer;
                break;

            case model.ChartType.QUERY_PLAN:
                const queryPlanChartProps: model.IQueryPlanProps = {
                    ...partialChartProps,
                    height: this.state.height,
                };
                specificChart = {
                    type: this.props.chartType,
                    props: queryPlanChartProps,
                };
                chartClass = QueryPlan;
                break;
        }

        this.props.setCurrentChart(specificChart.type);
        return React.createElement(chartClass!, specificChart.props as any);
    }

    isChartDataLoading(): boolean {

        if (this.props.resultLoading[this.state.chartId] || !this.props.chartData[this.state.chartId]) {
            return true;
        } else {
            return false;
        }
    }

    renderChartOptions(): JSX.Element | undefined {
        //return div with chart options or undefined if there are no chart options
        let chartOptions = undefined;
        if (this.props.chartType === model.ChartType.MEMORY_ACCESS_HEATMAP_CHART) {
            chartOptions = <HeatmapsDiffToggler />
        }
        return chartOptions ? <div className={styles.chartOptionsContainer}>
            {chartOptions}
        </div> : undefined;
    }


    public render() {

        if (!this.props.umbraperfFileParsingFinished) {
            return <Redirect to={"/upload"} />
        }

        return <div className={styles.elementWrapper} ref={this.elementWrapper}>
            {this.renderChartOptions()}
            {this.isChartDataLoading()
                ? <Spinner />
                : <div className={styles.chartContainer}>
                    {this.createChildChart()}
                </div>
            }
        </div>;
    }

}

const mapStateToProps = (state: model.AppState) => ({
    umbraperfFileParsingFinished: state.umbraperfFileParsingFinished,
    chartIdCounter: state.chartIdCounter,
    resultLoading: state.resultLoading,
    chartData: state.chartData,
    events: state.events,
    pipelines: state.pipelines,
    operators: state.operators,
    currentEvent: state.currentEvent,
    currentMultipleEvent: state.currentMultipleEvent,
    currentOperator: state.currentOperator,
    currentPipeline: state.currentPipeline,
    currentView: state.currentView,
    currentTimeBucketSelectionTuple: state.currentTimeBucketSelectionTuple,
    currentMemoryAddressSelectionTuple: state.currentMemoryAddressSelectionTuple,
    currentBucketSize: state.currentBucketSize,
    memoryHeatmapsDifferenceRepresentation: state.memoryHeatmapsDifferenceRepresentation,
});

const mapDispatchToProps = (dispatch: model.Dispatch) => ({
    setChartIdCounter: (newChartIdCounter: number) => dispatch({
        type: model.StateMutationType.SET_CHART_ID_COUNTER,
        data: newChartIdCounter,
    }),
    setCurrentChart: (newCurrentChart: model.ChartType) => dispatch({
        type: model.StateMutationType.SET_CURRENT_CHART,
        data: newCurrentChart,
    }),
});


export default connect(mapStateToProps, mapDispatchToProps)(Context.withAppContext(ChartWrapper));
