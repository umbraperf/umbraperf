import * as model from '../../model/';
import * as Context from '../../app_context';
import React from 'react';
import styles from "../../style/utils.module.css";
import { connect } from 'react-redux';


interface Props {
    appContext: Context.IAppContext;
    fileLoading: boolean;
    file: undefined | File;
    resultLoading: model.ResultLoading;
    chartData: model.ChartDataKeyValue;
    chartIdCounter: number;
    events: Array<string> | undefined;
    pipelines: Array<string> | undefined;
    operators: Array<string> | undefined;
    kpis: Array<model.IKpiData> | undefined;
}

function StatusIndicator(props: Props) {

    const getStatusString = () => {
        return "Status: " + getCurrentStatus();

    }

    const truncateString = (text: string) => {
        const length = 20;
        return text.length > length ? text.substring(0, length - 1) + '&hellip;' : text;
    }

    const getCurrentStatus = () => {
        const loading = isResultLoading();
        if (undefined === props.file && false === props.fileLoading) {
            return "No file selected.";
        }
        if (true === props.fileLoading && props.file) {
            return `Reading file (${truncateString(props.file.name)})...`;
        }
        if ((loading && props.resultLoading[-1] === true) ||
            undefined === props.events ||
            undefined === props.pipelines ||
            undefined === props.operators ||
            undefined === props.kpis) {
            return "Fetching metadata..."
        }
        if (loading) {
            return `Rendering ${getLoadingChartName()}...`
        }
        if (!loading) {
            return "Done.";
        }
        return "";
    }

    const isResultLoading = () => {
        for (let resultId in props.resultLoading) {
            if (true === props.resultLoading[resultId]) {
                return true;
            }
        }
        return false;
    }

    const getLoadingChartName = () => {
        for (let resultId in props.resultLoading) {
            if (true === props.resultLoading[resultId]) {
                console.log(props.chartData);
                return resultId;
            }
        }
        return "";
    }

    return (
        <div>{getStatusString()}</div>
    );
}

const mapStateToProps = (state: model.AppState) => ({
    file: state.file,
    fileLoading: state.fileLoading,
    resultLoading: state.resultLoading,
    chartData: state.chartData,
    chartIdCounter: state.chartIdCounter,
    events: state.events,
    pipelines: state.pipelines,
    operators: state.operators,
    kpis: state.kpis,
});


export default connect(mapStateToProps)(Context.withAppContext(StatusIndicator));