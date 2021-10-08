import * as model from '../model';
import React from 'react';
import styles from '../style/dummy.module.css';
import { Redirect } from 'react-router-dom';
import { connect } from 'react-redux';
import EventsButtons from './utils/events_buttons';
import KpiContainer from './utils/kpi_container';
import InterpolationDropdown from './utils/interpolation_dropdown';
import BucketsizeDropdwn from './utils/bucketsize_dropdown';
import DonutChart from '../components/charts/donut_chart';
import SwimLanesMultiplePipelines from '../components/charts/swim_lanes_multiple_pipelines';
import BarChart from '../components/charts/bar_chart';
import BarChartActivityHistogram from '../components/charts/bar_chart_activity_histogram';
import { Grid, Box } from '@material-ui/core';




interface Props {
    csvParsingFinished: boolean;
}


class Dashboard extends React.Component<Props, {}> {


    constructor(props: Props) {
        super(props);
    }


    public render() {

        if (!this.props.csvParsingFinished) {
            return <Redirect to={"/upload"} />
        }

        return <div className={styles.dashboardGrid}>

            <div >
                <Grid container className={styles.dashboardGridOptionsContainer} >
                    <Box clone order={{ xs: 1, sm: 1, lg: 1 }}>
                        <Grid item className={styles.dashboardGridCellItem} xs={12} lg={6} >
                            <Box className={styles.dashboardGridCellOptionsBox}>
                                <div className={styles.dashboardGridCellOptionsContainer}>
                                    <EventsButtons />
                                </div>
                            </Box>
                        </Grid>
                    </Box>
                    <Box clone order={{ xs: 3, sm: 3, lg: 2 }}>
                        <Grid item className={styles.dashboardGridCellItem} xs={12} lg={3} >
                            <Box className={styles.dashboardGridCellOptionsBox}>
                                <div className={styles.dashboardGridCellOptionsContainer} >
                                    <KpiContainer />
                                </div>
                            </Box>
                        </Grid>
                    </Box>
                    <Box clone order={{ xs: 2, sm: 2, lg: 3 }}>
                        <Grid item className={styles.dashboardGridCellItem} xs={12} lg={3} >
                            <Box className={styles.dashboardGridCellOptionsBox}>
                                <div className={styles.dashboardGridCellOptionsContainer} >
                                    <InterpolationDropdown />
                                    <BucketsizeDropdwn />
                                </div>
                            </Box>
                        </Grid>
                    </Box>

                </Grid>


                <Grid container>
                    <Box clone order={{ xs: 1, sm: 1, lg: 1 }}>
                        <Grid item className={`${styles.dashboardGridCellItem} ${styles.dashboardGridCellItemActivityHistogramStaticWidthSmallScreen}`}  xs={12} >
                            <Box className={`${styles.dashboardGridCellBox} ${styles.dashboardGridCellBoxActivityHistogramStaticWidthSmallScreen}`}>
                                <div className={styles.dashboardGridCellChartContainer}>
                                    <BarChartActivityHistogram />
                                </div>
                            </Box>
                        </Grid>
                    </Box>


                    <Box clone order={{ xs: 2, md: 2, lg: 2 }}>
                        <Grid item className={styles.dashboardGridCellItem} xs={12} md={6} lg={4} >
                            <Box className={styles.dashboardGridCellBoxMainVisualizations}>
                                <div className={styles.dashboardGridCellChartContainer}>
                                    <DonutChart />
                                </div>
                            </Box>
                        </Grid>
                    </Box>
                    <Box clone order={{ xs: 4, md: 4, lg: 3 }}>
                        <Grid item className={`${styles.dashboardGridCellItem} ${styles.dashboardGridCellItemAreaChartStaticWidthSmallScreen}`} xs={12} md={12} lg={8}>
                            <Box className={`${styles.dashboardGridCellBoxMainVisualizations} ${styles.dashboardGridCellBoxAreaChartStaticWidthSmallScreen}`}>
                                <div className={styles.dashboardGridCellChartContainer}>
                                    <SwimLanesMultiplePipelines />
                                </div>
                            </Box>
                        </Grid>
                    </Box>


                    <Box clone order={{ xs: 3, md: 3, lg: 4 }}>
                        <Grid item className={styles.dashboardGridCellItem} xs={12} md={6} lg={4} >
                            <Box className={styles.dashboardGridCellBoxMainVisualizations}>
                                <div className={styles.dashboardGridCellChartContainer}>
                                    <BarChart onDashboard={true} />
                                </div>
                            </Box>
                        </Grid>
                    </Box>
                    <Box clone order={{ xs: 5, md: 5, lg: 5 }}>
                        <Grid item className={`${styles.dashboardGridCellItem} ${styles.dashboardGridCellItemAreaChartStaticWidthSmallScreen}`} xs={12} md={12} lg={8} >
                            <Box className={`${styles.dashboardGridCellBoxMainVisualizations} ${styles.dashboardGridCellBoxAreaChartStaticWidthSmallScreen}`}>
                                <div className={styles.dashboardGridCellChartContainer}>
                                    <SwimLanesMultiplePipelines absoluteValues={true} />
                                </div>
                            </Box>
                        </Grid>
                    </Box>

                </Grid>

            </div>


        </div>;
    }


}

const mapStateToProps = (state: model.AppState) => ({

    csvParsingFinished: state.csvParsingFinished,
});



export default connect(mapStateToProps)(Dashboard);



