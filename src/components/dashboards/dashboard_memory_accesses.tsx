import React from 'react';
import styles from '../../style/dashboard.module.css';
import DashboardHeader from './dashboard_header';
import MemoryAccessHeatmapChart from '../charts/memory_access_heatmap_chart';
import BarChartActivityHistogram from '../charts/bar_chart_activity_histogram';
import { Grid, Box } from '@material-ui/core';


class DashboardMemoryAccesses extends React.Component<{}, {}> {


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
                        <Grid item className={styles.dashboardGridCellItem} xs={12} md={12} lg={12} >
                            <Box className={styles.dashboardGridCellChartBoxMemoryChart}>
                                <div className={styles.dashboardGridCellChartContainer}>
                                    <MemoryAccessHeatmapChart />
                                </div>
                            </Box>
                        </Grid>
                    </Box>
                </Grid>

            </div>
        </div >;
    }

}

export default DashboardMemoryAccesses;



