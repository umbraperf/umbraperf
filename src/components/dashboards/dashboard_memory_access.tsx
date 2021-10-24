import React from 'react';
import styles from '../../style/dashboard.module.css';
import DashboardHeader from './dashboard_header';
import SunburstChart from '../charts/sunburst_chart';
import SwimLanesCombinedMultiplePipelines from '../charts/swim_lanes_combined_multiple_pipelines';
import BarChartActivityHistogram from '../charts/bar_chart_activity_histogram';
import { Grid, Box } from '@material-ui/core';


class DashboardMemoryAccess extends React.Component<{}, {}> {


    constructor(props: any) {
        super(props);
    }

    public render() {

        return <div className={styles.dashboardGrid}>

            <div >
                <DashboardHeader />

                <Grid container>
                    <Box clone order={{ xs: 1, sm: 1, lg: 1 }}>
                        <Grid item className={styles.dashboardGridCellItem} xs={12} >
                            <Box className={styles.dashboardGridCellChartBoxActivityHistogram}>
                                <div className={styles.dashboardGridCellChartContainer}>
                                    <BarChartActivityHistogram />
                                </div>
                            </Box>
                        </Grid>
                    </Box>


                    <Box clone order={{ xs: 2, md: 2, lg: 2 }}>
                        <Grid item className={styles.dashboardGridCellItem} xs={12} md={12} lg={4} >
                            <Box className={styles.dashboardGridCellChartBoxMainVisualizations}>
                                <div className={`${styles.dashboardGridCellChartContainer} ${styles.dashboardGridCellChartContainerStaticWidthSmall}`}>
                                    <SunburstChart />
                                </div>
                            </Box>
                        </Grid>
                    </Box>
                    <Box clone order={{ xs: 4, md: 4, lg: 3 }}>
                        <Grid item className={styles.dashboardGridCellItem} xs={12} md={12} lg={8}>
                            <Box className={styles.dashboardGridCellChartBoxMainVisualizations}>
                                <div className={styles.dashboardGridCellChartContainer}>
                                    <SwimLanesCombinedMultiplePipelines absoluteValues={true} />
                                </div>
                            </Box>
                        </Grid>
                    </Box>
                </Grid>

            </div>
        </div >;
    }

}

export default DashboardMemoryAccess;



