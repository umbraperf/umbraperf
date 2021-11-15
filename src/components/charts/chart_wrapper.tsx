import * as model from '../../model';
import * as Controller from '../../controller';
import * as Context from '../../app_context';
import Spinner from '../utils/spinner';
import React from 'react';
import { connect } from 'react-redux';
import { Redirect } from 'react-router-dom';
import { createRef } from 'react';
import _ from "lodash";

import SunburstChart from './vega_visualizations/sunburst_chart';
import BarChart from './vega_visualizations/bar_chart';
import BarChartActivityHistogram from './vega_visualizations/bar_chart_activity_histogram';
import SwimLanesMultiplePipelines from './vega_visualizations/swim_lanes_multiple_pipelines';
import SwimLanesCombinedMultiplePipelines from './vega_visualizations/swim_lanes_combined_multiple_pipelines';
import MemoryAccessHeatmapChart from './vega_visualizations/memory_access_heatmap_chart';
import UirViewer from './uir/uir_viewer';


interface OwnProps {
    chartType: model.ChartType;
}

export interface ChartWrapperAppstateProps {
    appContext: Context.IAppContext;
    chartIdCounter: number;
    csvParsingFinished: boolean;
    resultLoading: model.ResultLoading;
    chartData: model.ChartDataKeyValue,
    events: Array<string> | undefined;
    pipelines: Array<string> | undefined;
    operators: Array<string> | undefined;
    currentEvent: string;
    currentMultipleEvent: [string, string] | "Default";
    currentOperator: Array<string> | "All",
    currentPipeline: Array<string> | "All",
    currentView: model.ViewType;
    currentTimeBucketSelectionTuple: [number, number],
    currentBucketSize: number,

    setChartIdCounter: (newChartIdCounter: number) => void;
    setCurrentChart: (newCurrentChart: string) => void;
}

type Props = OwnProps & ChartWrapperAppstateProps;

interface State {
    chartId: number,
    width: number,
    height: number,
}

let globalInputDataChanged: boolean;

class ChartWrapper extends React.Component<Props, State> {

    elementWrapper = createRef<HTMLDivElement>();

    constructor(props: Props) {
        super(props);
        this.state = {
            chartId: this.props.chartIdCounter,
            width: 0,
            height: 0,
        };
        this.props.setChartIdCounter((this.state.chartId) + 1);
        globalInputDataChanged = false;
    }

    shouldComponentUpdate(nextProps: Props, nextState: State) {

        globalInputDataChanged = false;

        //rerender only on affected input data changed and if they are available, store if this is the case to avoid checking the condition to fetch the data later twice
        if (Controller.chartRerenderNeeded(nextProps, this.props, this.props.chartType)) {
            globalInputDataChanged = true;
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

        if (this.props.csvParsingFinished) {
            this.props.setCurrentChart(this.props.chartType);

            addEventListener('resize', (event) => {
                this.resizeListener();
            });
        }
    }


    componentDidUpdate(prevProps: Props): void {
        //Controller.newChartDataNeeded(this.props, prevProps, this.props.chartType, this.state.chartId);
        if (globalInputDataChanged) {
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

                child.style.display = 'block';
            }
        }

    }

    createChildChart() {

        const partialChartProps: model.IParcialChartProps = {
            key: this.state.chartId + this.state.width + this.state.height,
            chartId: this.state.chartId,
            width: this.state.width,
            chartType: this.props.chartType,
        }

        switch (this.props.chartType) {

            case model.ChartType.BAR_CHART_ACTIVITY_HISTOGRAM:
                const barChartActivityHistogramProps: model.IBarChartActivityHistogramProps = {
                    ...partialChartProps,
                }
                return React.createElement(BarChartActivityHistogram, barChartActivityHistogramProps as any);

            case model.ChartType.BAR_CHART:
                const barChartProps: model.IBarChartProps = {
                    ...partialChartProps,
                    onDashboard: true,
                    height: this.state.height,
                }
                return React.createElement(BarChart, barChartProps as any);


            case model.ChartType.SUNBURST_CHART:
                const sunburstProps: model.ISunburstChartProps = {
                    ...partialChartProps,
                    height: this.state.height,
                    doubleRowSize: this.state.height > 400 ? true : false,
                }
                return React.createElement(SunburstChart, sunburstProps as any);

            case model.ChartType.SWIM_LANES_MULTIPLE_PIPELINES:
                const swimLanesMultiplePipelinesProps: model.ISwimlanesProps = {
                    ...partialChartProps,
                    height: this.state.height,
                    absoluteValues: false,
                }
                return React.createElement(SwimLanesMultiplePipelines, swimLanesMultiplePipelinesProps as any);

            case model.ChartType.SWIM_LANES_MULTIPLE_PIPELINES_ABSOLUTE:
                const swimLanesMultiplePipelinesAbsoluteProps: model.ISwimlanesProps = {
                    ...partialChartProps,
                    height: this.state.height,
                    absoluteValues: true,
                }
                return React.createElement(SwimLanesMultiplePipelines, swimLanesMultiplePipelinesAbsoluteProps as any);

            case model.ChartType.SWIM_LANES_COMBINED_MULTIPLE_PIPELINES_ABSOLUTE:
                const swimLanesCombinedMultiplePipelinesAbsoluteProps: model.ISwimlanesProps = {
                    ...partialChartProps,
                    height: this.state.height,
                    absoluteValues: true,
                }
                return React.createElement(SwimLanesCombinedMultiplePipelines, swimLanesCombinedMultiplePipelinesAbsoluteProps as any);

            case model.ChartType.MEMORY_ACCESS_HEATMAP_CHART:
                const memoryAccessHeatmapChartProps: model.IMemoryAccessHeatmapChartProps = {
                    ...partialChartProps,
                }
                return React.createElement(MemoryAccessHeatmapChart, memoryAccessHeatmapChartProps as any);

            case model.ChartType.UIR_VIEWER:
                const uirViewerChartProps: model.IMemoryAccessHeatmapChartProps = {
                    ...partialChartProps,
                }
                return React.createElement(UirViewer, uirViewerChartProps as any);

        }
    }

    isComponentLoading(): boolean {

        if (this.props.resultLoading[this.state.chartId] || !this.props.chartData[this.state.chartId]) {
            return true;
        } else {
            return false;
        }
    }


    public render() {

        if (!this.props.csvParsingFinished) {
            return <Redirect to={"/upload"} />
        }

        return <div ref={this.elementWrapper} style={{ display: "block", height: "100%", width: "100%" }}>
            {this.isComponentLoading()
                ? <Spinner />
                : <div className={"vegaContainer"}>
                    {this.createChildChart()}
                </div>
            }
        </div>;
    }

}

const mapStateToProps = (state: model.AppState) => ({
    csvParsingFinished: state.csvParsingFinished,
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
    currentBucketSize: state.currentBucketSize,


});

const mapDispatchToProps = (dispatch: model.Dispatch) => ({
    setChartIdCounter: (newChartIdCounter: number) => dispatch({
        type: model.StateMutationType.SET_CHARTIDCOUNTER,
        data: newChartIdCounter,
    }),
    setCurrentChart: (newCurrentChart: string) => dispatch({
        type: model.StateMutationType.SET_CURRENTCHART,
        data: newCurrentChart,
    }),
});


export default connect(mapStateToProps, mapDispatchToProps)(Context.withAppContext(ChartWrapper));
