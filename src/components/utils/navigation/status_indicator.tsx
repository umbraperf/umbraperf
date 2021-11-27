// TODO fix bug last chart not showing

import * as model from '../../../model';
import * as Context from '../../../app_context';
import styles from '../../../style/utils.module.css';
import MiniSpinner from '../spinner/mini_spinner';
import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';


interface Props {
    fileLoading: boolean;
    file: undefined | File;
    resultLoading: model.ResultLoading;
    events: Array<string> | undefined;
    pipelines: Array<string> | undefined;
    operators: Array<string> | undefined;
    kpis: Array<model.IKpiData> | undefined;
    loadingChartReadableName: Array<model.ChartTypeReadable>;
}


function StatusIndicator(props: Props) {

    const [isLoading, setIsLoading] = useState(false);

    const truncateString = (text: string) => {
        const length = 20;
        return text.length > length ? text.substring(0, length - 1) + '&hellip;' : text;
    }

    const getCurrentStatus = () => {
        const loading = isResultLoading();
        if (undefined === props.file && false === props.fileLoading) {
            if (isLoading === true) {
                setIsLoading(false);
            }
            return "No file selected.";
        }
        if (true === props.fileLoading && props.file) {
            if (isLoading === false) {
                setIsLoading(true);
            }
            return `Reading file "${truncateString(props.file.name)}"...`;
        }

        if ((loading && props.resultLoading[-1] === true) ||
            undefined === props.events ||
            undefined === props.pipelines ||
            undefined === props.operators ||
            undefined === props.kpis) {
            if (isLoading === false) {
                setIsLoading(true);
            }
            return "Fetching metadata..."
        }
        if (loading) {
            if (isLoading === false) {
                setIsLoading(true);
            }
            return `Rendering "${getLoadingChartName()}"...`
        }
        if (!loading && Object.keys(props.resultLoading).length > 0) {
            if (isLoading === true) {
                setIsLoading(false);
            }
            return "Done.";
        }
        return "Loading...";
    }

    const isResultLoading = () => {
        for (let resultId in props.resultLoading) {
            if (true === props.resultLoading[resultId]) {
                return true;
            }
        }
        return false;
    }

    const getLoadingChartName: () => model.ChartTypeReadable = () => {
        const currentLoadingIndex = Object.values(props.resultLoading).indexOf(true, 0);
        return props.loadingChartReadableName[currentLoadingIndex];
    }

    const getCurrentStatusString = () => {
        return "Status: " + getCurrentStatus();
    }

    return (
        <div className={styles.statusContainer}>
            {getCurrentStatusString()}
            {isLoading && <MiniSpinner />}
        </div>
    );
}

const mapStateToProps = (state: model.AppState) => ({
    file: state.file,
    fileLoading: state.fileLoading,
    resultLoading: state.resultLoading,
    events: state.events,
    pipelines: state.pipelines,
    operators: state.operators,
    kpis: state.kpis,
    loadingChartReadableName: state.loadingChartReadableName,
});


export default connect(mapStateToProps)(StatusIndicator);