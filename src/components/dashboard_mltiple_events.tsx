import * as model from '../model';
import React from 'react';
import styles from '../style/dashboard.module.css';
import { Redirect } from 'react-router-dom';
import { connect } from 'react-redux';
import EventsButtons from './utils/events_buttons';
import KpiContainer from './utils/kpi_container';
import DropdownsOptions from './utils/dropdowns_options';
import SunburstChart from './charts/sunburst_chart';
import SwimLanesCombinedMultiplePipelines from './charts/swim_lanes_combined_multiple_pipelines';
import BarChartActivityHistogram from './charts/bar_chart_activity_histogram';
import { Grid, Box } from '@material-ui/core';


interface Props {
    csvParsingFinished: boolean;
    setCurrentChart: (newCurrentChart: string) => void;
}


class DashboardMultipleEvents extends React.Component<Props, {}> {


    constructor(props: Props) {
        super(props);
    }

    componentDidMount() {
        this.props.setCurrentChart(model.ChartType.DUMMY);
    }


    public render() {

        if (!this.props.csvParsingFinished) {
            return <Redirect to={"/upload"} />
        }

        return <div className={styles.dashboardGrid}>

            <div >
                <Grid container>
                    <Box clone order={{ xs: 1, lg: 1, xl: 1 }}>
                        <Grid item className={styles.dashboardGridCellOptionsItem} xs={12} lg={8} xl={5}>
                            <Box className={styles.dashboardGridCellOptionsBox}>
                                <EventsButtons multipleEvents={true} />
                            </Box>
                        </Grid>
                    </Box>
                    <Box clone order={{ xs: 3, lg: 3, xl: 2 }}>
                        <Grid item className={styles.dashboardGridCellOptionsItem} xs={12} lg={12} xl={4} >
                            <Box className={styles.dashboardGridCellOptionsBox}>
                                <KpiContainer />
                            </Box>
                        </Grid>
                    </Box>
                    <Box clone order={{ xs: 2, lg: 2, xl: 3 }}>
                        <Grid item className={styles.dashboardGridCellOptionsItem} xs={12} lg={4} xl={3}>
                            <Box className={styles.dashboardGridCellOptionsBox}>
                                <DropdownsOptions />
                            </Box>
                        </Grid>
                    </Box>
                </Grid>


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
                        <Grid item className={styles.dashboardGridCellItem} xs={12} md={6} lg={4} >
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

const mapStateToProps = (state: model.AppState) => ({

    csvParsingFinished: state.csvParsingFinished,
});

const mapDispatchToProps = (dispatch: model.Dispatch) => ({
    setCurrentChart: (newCurrentChart: string) => dispatch({
        type: model.StateMutationType.SET_CURRENTCHART,
        data: newCurrentChart,
    }),
});



export default connect(mapStateToProps, mapDispatchToProps)(DashboardMultipleEvents);



