import React from 'react';
import * as model from '../../model';
import styles from '../../style/dashboard.module.css';
import ChartWrapper from '../charts/chart_wrapper';
import QueryPlanWrapper from '../charts/queryplan/query_plan_wrapper';
import { Grid, Box } from '@material-ui/core';


class DashboardUir extends React.Component<{}, {}> {

    public render() {

        return <Grid container className={styles.visualizationGridFullScreenNoOverflow}>
            <Box clone order={{ xs: 1, sm: 1, lg: 1 }}>
                <Grid item className={styles.dashboardGridCellItemFullScreenFixedContent} xs={12}>
                    <Box className={styles.dashboardGridCellChartBoxActivityHistogram}>
                        <div className={styles.dashboardGridCellChartContainer}>
                            <ChartWrapper chartType={model.ChartType.BAR_CHART_ACTIVITY_HISTOGRAM} />
                        </div>
                    </Box>
                </Grid>
            </Box>

            <Box clone order={{ xs: 2, md: 2, lg: 2 }}>
                <Grid item container direction="row" className={styles.dashboardGridCellItemFullScreenStretchContent} xs={12} md={12} lg={12}>
                    <Box clone order={{ xs: 1, md: 1, lg: 1 }}>
                        <Grid item className={styles.dashboardGridCellChartBoxAutoheightFullheightStretchChart} xs={12} md={9} lg={9}>
                            <div className={styles.dashboardGridCellChartContainer}>
                                <ChartWrapper chartType={model.ChartType.UIR_VIEWER} />
                            </div>
                        </Grid>
                    </Box>
                    <Box clone order={{ xs: 2, md: 2, lg: 2 }}>
                        <Grid item className={styles.dashboardGridCellChartBoxAutoheightFullheightStretchChart} xs={12} md={3} lg={3}>
                            <div className={styles.dashboardGridCellChartContainer}>
                                <QueryPlanWrapper />
                            </div>
                        </Grid>
                    </Box>
                </Grid>
            </Box>

        </Grid>
    }
}


export default DashboardUir;



