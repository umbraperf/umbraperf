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

}

function StatusIndicator(props: Props) {

    const getStatusString = () => {
        return "Status: " + getCurrentStatus();

    }

    const getCurrentStatus = () => {
        if (undefined === props.file && false === props.fileLoading) {
            return "No file selected.";
        }
        if (true === props.fileLoading && props.file) {
            return `Reading file (${(props.file.name.length > 20) ? props.file.name.substr(0, 20) + '&hellip;' : props.file.name})...`;
        }
        if(!isResultLoading() && Object.keys(props.chartData).length === 0){
            return "Initialising...";
        }
        if(isResultLoading()){
            // TODO name rendering chart
            return `Rendering ${"xxx"}...`
        }
        return "Done.";
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
});


export default connect(mapStateToProps)(Context.withAppContext(StatusIndicator));