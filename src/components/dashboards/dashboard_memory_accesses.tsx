import React from 'react';
import * as model from '../../model';
import styles from '../../style/dashboard.module.css';
import DashboardHeader from './dashboard_header';
import ChartWrapper from '../charts/chart_wrapper';
import { Grid, Box } from '@material-ui/core';
import { connect } from 'react-redux';

interface Props {
    setCurrentView: (newCurrentView: model.ViewType) => void;
}

class DashboardMemoryAccesses extends React.Component<Props, {}> {


    constructor(props: any) {
        super(props);
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
                    <Box className={styles.dashboardGridCellChartBoxMemoryChart}>
                        <div className={styles.dashboardGridCellChartContainer}>
                            <ChartWrapper chartType={model.ChartType.MEMORY_ACCESS_HEATMAP_CHART} />
                        </div>
                    </Box>
                </Grid>
            </Box>
        </Grid>

    }

}

const mapDispatchToProps = (dispatch: model.Dispatch) => ({
    setCurrentView: (newCurrentView: model.ViewType) =>
        dispatch({
            type: model.StateMutationType.SET_CURRENTVIEW,
            data: newCurrentView,
        }),
});

export default connect(undefined, mapDispatchToProps)(DashboardMemoryAccesses);



