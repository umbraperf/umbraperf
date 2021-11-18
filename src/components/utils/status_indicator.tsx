import * as model from '../../model/';
import * as Context from '../../app_context';
import React from 'react';
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
    queryPlan: object | undefined;

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
        if (!loading && undefined === props.queryPlan) {
            return "Rendering queryplan..."

        }
        if ((loading && props.resultLoading[-1] === true) ||
            undefined === props.events ||
            undefined === props.pipelines ||
            undefined === props.operators ||
            undefined === props.kpis) {
            return "Fetching metadata..."
        }
        if (loading) {
            return `Rendering (${getLoadingChartName()})...`
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

    const getLoadingChartName: () => model.ChartTypeReadable = () => {
        const currentLoadingIndex = Object.values(props.resultLoading).indexOf(true, 0);
        return props.loadingChartReadableName[currentLoadingIndex];
    }

    return (
        <div>{getStatusString()}</div>
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
    queryPlan: state.queryPlan,
});


export default connect(mapStateToProps)(StatusIndicator);