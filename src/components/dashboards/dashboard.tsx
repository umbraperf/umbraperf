import React from 'react';
import * as model from '../../model';
import styles from '../../style/dashboard.module.css';
import DashboardHeader from './dashboard_header';
import ChartWrapper from '../charts/chart_wrapper';
import QueryPlanWrapper from '../queryplan/query_plan_wrapper';
import { Grid, Box } from '@material-ui/core';
import { connect } from 'react-redux';

interface Props {
    setCurrentView: (newCurrentView: model.ViewType) => void;
}

class Dashboard extends React.Component<Props, {}> {

    constructor(props: any) {
        super(props);
    }

    componentDidMount(): void {
        this.props.setCurrentView(model.ViewType.DASHBOARD);
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
                                    <QueryPlanWrapper />
                                </div>
                            </Box>
                        </Grid>
                    </Box>


                    <Box clone order={{ xs: 3, md: 3, lg: 4 }}>
                        <Grid item className={styles.dashboardGridCellItem} xs={12} md={6} lg={4} >
                            <Box className={styles.dashboardGridCellChartBoxMainVisualizations}>
                                <div className={`${styles.dashboardGridCellChartContainer} ${styles.dashboardGridCellChartContainerStaticWidthSmall}`}>
                                    <ChartWrapper chartType={model.ChartType.SUNBURST_CHART} />
                                </div>
                            </Box>
                        </Grid>
                    </Box>
                    <Box clone order={{ xs: 5, md: 5, lg: 5 }}>
                        <Grid item className={styles.dashboardGridCellItem} xs={12} md={12} lg={8} >
                            <Box className={styles.dashboardGridCellChartBoxMainVisualizations}>
                                <div className={styles.dashboardGridCellChartContainer}>
                                    <ChartWrapper chartType={model.ChartType.SWIM_LANES_MULTIPLE_PIPELINES} />
                                </div>
                            </Box>
                        </Grid>
                    </Box>


                    <Box clone order={{ xs: 3, md: 3, lg: 6 }}>
                        <Grid item className={styles.dashboardGridCellItem} xs={12} md={6} lg={4} >
                            <Box className={styles.dashboardGridCellChartBoxMainVisualizations}>
                                <div className={`${styles.dashboardGridCellChartContainer} ${styles.dashboardGridCellChartContainerStaticWidthSmall}`}>
                                    <ChartWrapper chartType={model.ChartType.SUNBURST_CHART} />
                                </div>
                            </Box>
                        </Grid>
                    </Box>
                    <Box clone order={{ xs: 7, md: 7, lg: 7 }}>
                        <Grid item className={styles.dashboardGridCellItem} xs={12} md={6} lg={8}>
                            <Box className={styles.dashboardGridCellChartBoxMainVisualizations}>
                                <div className={styles.dashboardGridCellChartContainer}>
                                    <ChartWrapper chartType={model.ChartType.SWIM_LANES_MULTIPLE_PIPELINES_ABSOLUTE} />
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

export default connect(undefined, mapDispatchToProps)(Dashboard);



