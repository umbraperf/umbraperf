import React from 'react';
import * as model from '../../model';
import styles from '../../style/dashboard.module.css';
import DashboardHeader from './dashboard_header';
import SunburstChart from '../charts/sunburst_chart';
import SwimLanesCombinedMultiplePipelines from '../charts/swim_lanes_combined_multiple_pipelines';
import BarChartActivityHistogram from '../charts/bar_chart_activity_histogram';
import QueryPlanViewer from '../queryplan/query_plan_viewer';
import { Grid, Box } from '@material-ui/core';
import { connect } from 'react-redux';

interface Props {
    setCurrentView: (newCurrentView: model.ViewType) => void;
}

class DashboardMultipleEvents extends React.Component<Props, {}> {


    constructor(props: any) {
        super(props);
    }

    componentDidMount(): void {
        this.props.setCurrentView(model.ViewType.DASHBOARD_MULTIPLE_EVENTS);
    }

    public render() {

        return <div className={styles.dashboardGrid}>

            <div >
                <DashboardHeader multipleEvents={true} />

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

                    <Box clone order={{ xs: 5, md: 5, lg: 5 }}>
                        <Grid item className={styles.dashboardGridCellItem} xs={12}>
                            <Box className={styles.dashboardGridCellChartBoxMainVisualizations}>
                                <div className={styles.dashboardGridCellChartContainer}>
                                    <QueryPlanViewer />
                                </div>
                            </Box>
                        </Grid>
                    </Box>
                </Grid>

            </div>
        </div >;
    }

}

const mapDispatchToProps = (dispatch: model.Dispatch) => ({
    setCurrentView: (newCurrentView: model.ViewType) =>
        dispatch({
            type: model.StateMutationType.SET_CURRENTVIEW,
            data: newCurrentView,
        }),
});

export default connect(undefined, mapDispatchToProps)(DashboardMultipleEvents);



