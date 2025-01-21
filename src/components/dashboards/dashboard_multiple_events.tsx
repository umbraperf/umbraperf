import { Box, Grid } from '@material-ui/core';
import React from 'react';
import * as model from '../../model';
import * as styles from '../../style/dashboard.module.css';
import ChartWrapper from '../charts/chart_wrapper';


class DashboardMultipleEvents extends React.Component<{}, {}> {

    public render() {

        return <Grid container className={styles.visualizationGridFullScreenNoOverflow}>
            <Box clone order={{ xs: 1, sm: 1, lg: 1 }}>
                <Grid item className={styles.dashboardGridCellItemFullScreenFixedContent} xs={12} >
                    <Box className={styles.dashboardGridCellChartBoxActivityHistogram}>
                        <div className={styles.dashboardGridCellChartContainer}>
                            <ChartWrapper chartType={model.ChartType.BAR_CHART_ACTIVITY_HISTOGRAM} />
                        </div>
                    </Box>
                </Grid>
            </Box>


            <Box clone order={{ xs: 2, sm: 2, lg: 2 }}>
                <Grid item container >
                    <Box clone order={{ xs: 1, md: 1, lg: 1 }}>
                        <Grid item className={styles.dashboardGridCellItemFullScreenFixedContent} xs={12} md={6} lg={4} >
                            <Box className={styles.dashboardGridCellChartBoxMainVisualizations}>
                                <div className={`${styles.dashboardGridCellChartContainer} ${styles.dashboardGridCellChartContainerStaticWidthSmall}`}>
                                    <ChartWrapper chartType={model.ChartType.SUNBURST_CHART} />
                                </div>
                            </Box>
                        </Grid>
                    </Box>
                    <Box clone order={{ xs: 2, md: 2, lg: 2 }}>
                        <Grid item className={styles.dashboardGridCellItemFullScreenFixedContent} xs={12} md={6} lg={8}>
                            <Box className={styles.dashboardGridCellChartBoxMainVisualizations}>
                                <div className={styles.dashboardGridCellChartContainer}>
                                    <ChartWrapper chartType={model.ChartType.QUERY_PLAN} />
                                </div>
                            </Box>
                        </Grid>
                    </Box>
                </Grid>
            </Box>


            <Box clone order={{ xs: 3, md: 3, lg: 3 }}>
                <Grid item className={styles.dashboardGridCellItemFullScreenStretchContentMED} xs={12}>
                    <Box className={styles.dashboardGridCellChartBoxAutoheightFullheightStretchChart}>
                        <div className={styles.dashboardGridCellChartContainer}>
                            <ChartWrapper chartType={model.ChartType.SWIM_LANES_COMBINED_MULTIPLE_PIPELINES_ABSOLUTE} />
                        </div>
                    </Box>
                </Grid>
            </Box>

        </Grid>
    }

}


export default DashboardMultipleEvents;
