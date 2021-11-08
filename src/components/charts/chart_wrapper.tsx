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
import BarChartActivityHistogram from './bar_chart_activity_histogram';


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

        if (this.props.resultLoading[this.state.chartId] !== nextProps.resultLoading[this.state.chartId]) {
            return true;
        }
        if (!_.isEqual(this.props.resultLoading, nextProps.resultLoading)) {
            return false;
        }
        return true;
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
        Controller.requestNewChartData(this.props, prevProps, this.props.chartType, this.state.chartId);
    }


    resizeListener() {
        if (!this.elementWrapper) return;

        const child = this.elementWrapper.current;
        if (child) {
            const newWidth = child.offsetWidth;

            child.style.display = 'none';

            this.setState((state, props) => ({
                ...state,
                width: newWidth,
            }));

            child.style.display = 'block';
        }


    }

    createChildChart() {

        const partialChartProps: any = {
            chartId: this.state.chartId,
            width: this.state.width,
            chartType: this.props.chartType,
        }
        let chartProps: any = {};

        switch (this.props.chartType) {

            case model.ChartType.BAR_CHART_ACTIVITY_HISTOGRAM:
                console.log("create activity")
                chartProps = {
                    ...partialChartProps,
                }
                return React.createElement(BarChartActivityHistogram, chartProps);


            case model.ChartType.SUNBURST_CHART:
                console.log("create sunburst")
                chartProps = {
                    ...partialChartProps,
                    height: this.state.height,
                }
                return React.createElement(SunburstChart, chartProps);
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
