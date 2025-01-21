import Zoom from '@material-ui/core/Zoom';
import CheckCircleRoundedIcon from '@material-ui/icons/CheckCircleRounded';
import ErrorRoundedIcon from '@material-ui/icons/ErrorRounded';
import React, { useState } from 'react';
import { connect } from 'react-redux';
import * as model from '../../../model';
import * as styles from '../../../style/utils.module.css';
import MiniSpinner from '../spinner/mini_spinner';


interface Props {
    fileLoading: boolean;
    file: undefined | File;
    resultLoading: model.IResultLoading;
    events: Array<string> | undefined;
    pipelines: Array<string> | undefined;
    operators: model.IOperatorsData | undefined;
    kpis: Array<model.IKpiData> | undefined;
    loadingChartReadableName: Array<model.ChartTypeReadable>;
}


function StatusIndicator(props: Props) {

    enum LoadingState {
        NO_FILE_SELECTED = 'NO_FILE_SELECTED',
        LOADING = 'LOADING',
        DONE = 'DONE',
    }

    const [isLoading, setIsLoading] = useState(LoadingState.NO_FILE_SELECTED);

    const truncateString = (text: string) => {
        const length = 20;
        return text.length > length ? text.substring(0, length - 1) + '...' : text;
    }

    const getCurrentStatusString = () => {
        const loading = isResultLoading();
        if (undefined === props.file && false === props.fileLoading) {
            if (isLoading !== LoadingState.NO_FILE_SELECTED) {
                setIsLoading(LoadingState.NO_FILE_SELECTED);
            }
            return "No file selected.";
        }
        if (true === props.fileLoading && props.file) {
            if (isLoading !== LoadingState.LOADING) {
                setIsLoading(LoadingState.LOADING);
            }
            return `Reading file... (${truncateString(props.file.name)})`;
        }

        if ((loading && props.resultLoading[-1] === true) ||
            undefined === props.events ||
            undefined === props.pipelines ||
            undefined === props.operators ||
            undefined === props.kpis) {
            if (isLoading !== LoadingState.LOADING) {
                setIsLoading(LoadingState.LOADING);
            }
            return "Fetching metadata..."
        }
        if (loading) {
            if (isLoading !== LoadingState.LOADING) {
                setIsLoading(LoadingState.LOADING);
            }
            return `Rendering "${getLoadingChartName()}"...`
        }
        if (!loading && Object.keys(props.resultLoading).length > 0 && props.file) {
            if (isLoading !== LoadingState.DONE) {
                setIsLoading(LoadingState.DONE);
            }
            return `Done. (${truncateString(props.file.name)})`;
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

    // const getCurrentStatusString = () => {
    //     return "Status: " + getCurrentStatus();
    // }

    const getCurrentStatusSymbol = () => {
        switch (isLoading) {
            case LoadingState.NO_FILE_SELECTED:
                return <ErrorRoundedIcon fontSize='small' />;
            case LoadingState.LOADING:
                return <MiniSpinner />;
            case LoadingState.DONE:
                return <Zoom in={true}><CheckCircleRoundedIcon fontSize='small' /></Zoom>;
        }
    }

    return (
        <div className={styles.statusContainer}>
            <div className={styles.statusString}>
                {getCurrentStatusString()}
            </div>
            <div className={styles.statusSymbol}>
                {getCurrentStatusSymbol()}
            </div>
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