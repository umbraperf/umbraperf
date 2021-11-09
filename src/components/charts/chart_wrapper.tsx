import * as model from '../../model';
import * as Controller from '../../controller';
import * as Context from '../../app_context';
import Spinner from '../utils/spinner';
import React from 'react';
import { connect } from 'react-redux';
import { Redirect } from 'react-router-dom';
import { createRef } from 'react';
import _ from "lodash";

import SunburstChart from './sunburst_chart';
import BarChart from './bar_chart';
import BarChartActivityHistogram from './bar_chart_activity_histogram';
import SwimLanesMultiplePipelines from './swim_lanes_multiple_pipelines';
import SwimLanesCombinedMultiplePipelines from './swim_lanes_combined_multiple_pipelines';
import MemoryAccessHeatmapChart from './memory_access_heatmap_chart';


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
    }

    shouldComponentUpdate(nextProps: Props, nextState: State) {

        //rerender on changed size
        if (this.state.width !== nextState.width || this.state.height !== nextState.height) {
            return true;
        }

        // //rerender on changed loading state, no rerender on different chart changes loading state
        // if(this.props.resultLoading[this.state.chartId]){

        // }
        if (this.props.resultLoading[this.state.chartId] !== nextProps.resultLoading[this.state.chartId]) {
            return true;
        } else if (!_.isEqual(this.props.resultLoading, nextProps.resultLoading)) {
            return false;
        }

        //TODO render conditions

        // //rerender only on affected input data changed and if they are available
        // if(Controller.chartRerenderNeeded(nextProps, this.props, this.props.chartType)){
        //     return true;
        // }

        // if(!_.isEqual(this.props.chartData, nextProps.chartData)){
        //     return true;
        // }

        if (Controller.chartRerenderNeeded(this.props, nextProps, this.props.chartType)) {
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
        if (Controller.chartRerenderNeeded(this.props, prevProps, this.props.chartType)) {
            Controller.requestChartData(this.props.appContext.controller, this.state.chartId, this.props.chartType);
        }
    }

    // componentWillUnmount() {
    //     removeEventListener('resize', (event) => {
    //         this.resizeListener();
    //     });
    // }

    resizeListener() {
        if (!this.elementWrapper) return;

        const child = this.elementWrapper.current;
        if (child) {
            const newWidth = child.offsetWidth;

            child.style.display = 'none';

            let resizingTimeoutId = undefined;
            clearTimeout(resizingTimeoutId);
            resizingTimeoutId = setTimeout(() => {
                this.setState((state, props) => ({
                    ...state,
                    width: newWidth,
                    //  renderedDagrePlan: undefined,
                }));
            }, 500);

            this.setState((state, props) => ({
                ...state,
                width: newWidth,
            }));

            child.style.display = 'block';
        }

    }

    createChildChart() {

        const partialChartProps: model.IParcialChartProps = {
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

        return <div ref={this.elementWrapper} style={{ display: "flex", height: "100%" }}>
            {this.isComponentLoading()
                ? <Spinner />
                : <div className={"vegaContainer"}>
                    {console.log("width: " + this.state.width)}
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
