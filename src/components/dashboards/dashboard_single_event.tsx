import React from 'react';
import * as model from '../../model';
import styles from '../../style/dashboard.module.css';
import ChartWrapper from '../charts/chart_wrapper';
import { Grid, Box } from '@material-ui/core';


class DashboardSingleEvent extends React.Component<{}, {}> {

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
                <Grid item className={styles.dashboardGridCellItem} xs={12} md={6} lg={4} >
                    <Box className={styles.dashboardGridCellChartBoxMainVisualizations}>
                        <div className={`${styles.dashboardGridCellChartContainer} ${styles.dashboardGridCellChartContainerStaticWidthSmall}`}>
                            <ChartWrapper chartType={model.ChartType.BAR_CHART} />
                        </div>
                    </Box>
                </Grid>
            </Box>
            <Box clone order={{ xs: 4, md: 4, lg: 3 }}>
                <Grid item className={styles.dashboardGridCellItem} xs={12} md={12} lg={8}>
                    <Box className={styles.dashboardGridCellChartBoxMainVisualizations}>
                        <div className={styles.dashboardGridCellChartContainer}>
                            <ChartWrapper chartType={model.ChartType.QUERY_PLAN} />
                        </div>
                    </Box>
                </Grid>
            </Box>

            <Box clone order={{ xs: 3, md: 3, lg: 4 }}>
                <Grid item className={styles.dashboardGridCellItemDoubleRow} xs={12} md={6} lg={4}>
                    <Box className={styles.dashboardGridCellChartBoxDoublerowVisualizations}>
                        <div className={`${styles.dashboardGridCellChartContainer} ${styles.dashboardGridCellChartContainerStaticWidthSmall}`}>
                            <ChartWrapper chartType={model.ChartType.SUNBURST_CHART} />
                        </div>
                    </Box>
                </Grid>
            </Box>
            <Box clone order={{ xs: 5, md: 5, lg: 5 }}>
                <Grid item container className={styles.dashboardGridCellItemDoubleRowInnerGridContainer} direction="column" xs={12} md={12} lg={8}>
                    <Grid item className={styles.dashboardGridCellItem}>
                        <Box className={styles.dashboardGridCellChartBoxMainVisualizations}>
                            <div className={styles.dashboardGridCellChartContainer}>
                                <ChartWrapper chartType={model.ChartType.SWIM_LANES_MULTIPLE_PIPELINES} />
                            </div>
                        </Box>
                    </Grid>
                    <Grid item className={styles.dashboardGridCellItem}>
                        <Box className={styles.dashboardGridCellChartBoxMainVisualizations}>
                            <div className={styles.dashboardGridCellChartContainer}>
                                <ChartWrapper chartType={model.ChartType.SWIM_LANES_MULTIPLE_PIPELINES_ABSOLUTE} />
                            </div>
                        </Box>
                    </Grid>
                </Grid>
            </Box>

            <Box clone order={{ xs: 6, sm: 6, lg: 6 }}>
                <Grid item className={styles.dashboardGridCellItem} xs={12} >
                    <Box className={styles.dashboardGridCellChartBoxMainVisualizations}>
                        <div className={styles.dashboardGridCellChartContainer}>
                            <ChartWrapper chartType={model.ChartType.SWIM_LANES_TMAM} />
                        </div>
                    </Box>
                </Grid>
            </Box>

        </Grid>
    }
}


export default DashboardSingleEvent;



