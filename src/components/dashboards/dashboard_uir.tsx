import { Box, Grid } from '@material-ui/core';
import React from 'react';
import * as model from '../../model';
import * as styles from '../../style/dashboard.module.css';
import ChartWrapper from '../charts/chart_wrapper';


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

            <Box clone order={{ xs: 2, sm: 2, lg: 2 }}>
                <Grid item container className={styles.dashboardGridCellItemFullScreenStretchContentMultiColumnContainer} >
                    <Box clone order={{ xs: 2, md: 2, lg: 1 }}>
                        <Grid item className={styles.dashboardGridCellItemFullScreenStretchContentUPD} xs={12} md={12} lg={9} >
                            <Box className={styles.dashboardGridCellChartBoxAutoheightFullheightStretchChart}>
                                <div className={styles.dashboardGridCellChartContainer}>
                                    <ChartWrapper chartType={model.ChartType.UIR_VIEWER} />
                                </div>
                            </Box>
                        </Grid>
                    </Box>
                    <Box clone order={{ xs: 1, md: 1, lg: 2 }}>
                        <Grid item className={styles.dashboardGridCellItemFullScreenStretchContentUPD} xs={12} md={12} lg={3} >
                            <Box className={styles.dashboardGridCellChartBoxAutoheightFullheightStretchChart}>
                                <div className={styles.dashboardGridCellChartContainer}>
                                    <ChartWrapper chartType={model.ChartType.QUERY_PLAN} />
                                </div>
                            </Box>
                        </Grid>
                    </Box>
                </Grid>
            </Box>

        </Grid>
    }
}


export default DashboardUir;
