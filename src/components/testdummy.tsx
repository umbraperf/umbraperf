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


class Dummy extends React.Component<Props, {}> {


    constructor(props: Props) {
        super(props);
    }


    public render() {

        if (!this.props.csvParsingFinished) {
            return <Redirect to={"/upload"} />
        }

        return <div className={styles.dummyGrid}>

            <div >
                <Grid container className={styles.dummyGridOptionsContainer} >
                    <Grid item className={styles.dummyGridCellItem} xs={12} lg={5} >
                        <Box className={styles.dummyGridCellOptionsBox}>
                            <div className={styles.dummyGridCellOptionsContainer}>
                                <EventsButtons />
                            </div>
                        </Box>
                    </Grid>
                    <Grid item className={styles.dummyGridCellItem} xs={12} lg={3} >
                        <Box className={styles.dummyGridCellOptionsBox}>
                            <div className={styles.dummyGridCellOptionsContainer}>
                                <KpiContainer />
                            </div>
                        </Box>
                    </Grid>
                    <Grid item className={styles.dummyGridCellItem} xs={12} lg={4} >
                        <Box className={styles.dummyGridCellOptionsBox}>
                            <div className={styles.dummyGridCellOptionsContainer} >
                                <InterpolationDropdown />
                                <BucketsizeDropdwn />
                            </div>
                        </Box>
                    </Grid>
                </Grid>


                <Grid container>
                    <Box clone order={{ xs: 1, sm: 1, lg: 1 }}>
                        <Grid item className={`${styles.dummyGridCellItem} ${styles.dummyGridCellItemActivityHistogramStaticWidthSmallScreen}`}  xs={12} >
                            <Box className={`${styles.dummyGridCellBox} ${styles.dummyGridCellBoxActivityHistogramStaticWidthSmallScreen}`}>
                                <div className={styles.dummyGridCellChartContainer}>
                                    <BarChartActivityHistogram />
                                </div>
                            </Box>
                        </Grid>
                    </Box>


                    <Box clone order={{ xs: 2, md: 2, lg: 2 }}>
                        <Grid item className={styles.dummyGridCellItem} xs={12} md={6} lg={4} >
                            <Box className={styles.dummyGridCellBox}>
                                <div className={styles.dummyGridCellChartContainer}>
                                    <DonutChart />
                                </div>
                            </Box>
                        </Grid>
                    </Box>
                    <Box clone order={{ xs: 4, md: 4, lg: 3 }}>
                        <Grid item className={`${styles.dummyGridCellItem} ${styles.dummyGridCellItemAreaChartStaticWidthSmallScreen}`} xs={12} md={12} lg={8}>
                            <Box className={`${styles.dummyGridCellBox} ${styles.dummyGridCellBoxAreaChartStaticWidthSmallScreen}`}>
                                <div className={styles.dummyGridCellChartContainer}>
                                    <SwimLanesMultiplePipelines />
                                </div>
                            </Box>
                        </Grid>
                    </Box>


                    <Box clone order={{ xs: 3, md: 3, lg: 4 }}>
                        <Grid item className={styles.dummyGridCellItem} xs={12} md={6} lg={4} >
                            <Box className={styles.dummyGridCellBox}>
                                <div className={styles.dummyGridCellChartContainer}>
                                    <BarChart onDashboard={true} />
                                </div>
                            </Box>
                        </Grid>
                    </Box>
                    <Box clone order={{ xs: 5, md: 5, lg: 5 }}>
                        <Grid item className={`${styles.dummyGridCellItem} ${styles.dummyGridCellItemAreaChartStaticWidthSmallScreen}`} xs={12} md={12} lg={8} >
                            <Box className={`${styles.dummyGridCellBox} ${styles.dummyGridCellBoxAreaChartStaticWidthSmallScreen}`}>
                                <div className={styles.dummyGridCellChartContainer}>
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



export default connect(mapStateToProps)(Dummy);



