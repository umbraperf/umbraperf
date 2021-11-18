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
        console.log(props.chartIdCounter);
        if (undefined === props.file && false === props.fileLoading) {
            return "No file selected.";
        }
        if (true === props.fileLoading && props.file) {
            return `Reading file (${truncateString(props.file.name)})...`;
        }
        if (props.file && !isResultLoading()) {
            return "Initialising...";
        }
        if (isResultLoading() && props.resultLoading[-1] && props.resultLoading[-1] === true) {
            return "Fetching metadata..."
            // TODO 
        }
        if (props.resultLoading[props.chartIdCounter] && props.resultLoading[props.chartIdCounter] === true) {
            // TODO name rendering chart
            return `Rendering ${props.chartIdCounter}...`
        }
        if (props.file && !isResultLoading() && Object.keys(props.chartData).length === 0) {
            return "Initialising...";
            //TODO 
        }
        if (props.file && !isResultLoading() && Object.keys(props.chartData).length > 0) {
            return "Done.";
            // TODO 
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
});


export default connect(mapStateToProps)(Context.withAppContext(StatusIndicator));