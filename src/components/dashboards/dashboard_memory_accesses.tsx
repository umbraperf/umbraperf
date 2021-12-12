import React from 'react';
import * as model from '../../model';
import styles from '../../style/dashboard.module.css';
import ChartWrapper from '../charts/chart_wrapper';
import { Grid, Box } from '@material-ui/core';
import { connect } from 'react-redux';
import _ from 'lodash';

interface Props {
    events: Array<string> | undefined;
    currentEvent: string,
    setCurrentEvent: (newCurrentEvent: string) => void;
}


class DashboardMemoryAccesses extends React.Component<Props, {}> {

    constructor(props: Props) {
        super(props);
        //switch current event to memory loads
        this.props.setCurrentEvent("mem_inst_retired.all_loads");
    }

    componentDidUpdate(prevProps: Props) {
        //on component init, current event was set to memory loads in constructor. if events finished loading and do not contain memory loads, set current event do last element of events available to use cycles as current event 
        if (!_.isEqual(prevProps.events, this.props.events) && this.props.events && !this.props.events.includes("mem_inst_retired.all_loads")) {
            this.props.setCurrentEvent(this.props.events[this.props.events.length - 1]);
        }
    }

    public render() {

        return <Grid container>
            <Box clone order={{ xs: 1, sm: 1, lg: 1 }}>
                <Grid item className={styles.dashboardGridCellItem} xs={12} >
                    <Box className={styles.dashboardGridCellChartBoxActivityHistogram}>
                        <div className={styles.dashboardGridCellChartContainer}>
                            <ChartWrapper chartType={model.ChartType.BAR_CHART_ACTIVITY_HISTOGRAM} />
                        </div>
                    </Box>
                </Grid>
            </Box>


            <Box clone order={{ xs: 2, md: 2, lg: 2 }}>
                <Grid item className={styles.dashboardGridCellItem} xs={12} md={12} lg={12} >
                    <Box className={styles.dashboardGridCellChartBoxAutoheightChart}>
                        <div className={styles.dashboardGridCellChartContainer}>
                            <ChartWrapper chartType={model.ChartType.MEMORY_ACCESS_HEATMAP_CHART} />
                        </div>
                    </Box>
                </Grid>
            </Box>
        </Grid>

    }

}

const mapStateToProps = (state: model.AppState) => ({
    events: state.events,
    currentEvent: state.currentEvent,
});

const mapDispatchToProps = (dispatch: model.Dispatch) => ({
    setCurrentView: (newCurrentView: model.ViewType) =>
        dispatch({
            type: model.StateMutationType.SET_CURRENTVIEW,
            data: newCurrentView,
        }),
    setCurrentEvent: (newCurrentEvent: string) =>
        dispatch({
            type: model.StateMutationType.SET_CURRENTEVENT,
            data: newCurrentEvent,
        }),
});

export default connect(mapDispatchToProps, mapDispatchToProps)(DashboardMemoryAccesses);



