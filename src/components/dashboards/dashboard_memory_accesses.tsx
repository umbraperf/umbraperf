import React from 'react';
import * as model from '../../model';
import styles from '../../style/dashboard.module.css';
import DashboardHeader from './dashboard_header';
import MemoryAccessHeatmapChart from '../charts/memory_access_heatmap_chart';
import BarChartActivityHistogram from '../charts/bar_chart_activity_histogram';
import { Grid, Box } from '@material-ui/core';
import { connect } from 'react-redux';

interface Props {
    setCurrentView: (newCurrentView: model.ViewType) => void;
}

class DashboardMemoryAccesses extends React.Component<Props, {}> {


    constructor(props: any) {
        super(props);
    }

    componentDidMount(): void {
        this.props.setCurrentView(model.ViewType.DASHBOARD_MEMORY);
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

const mapDispatchToProps = (dispatch: model.Dispatch) => ({
    setCurrentView: (newCurrentView: model.ViewType) =>
        dispatch({
            type: model.StateMutationType.SET_CURRENTVIEW,
            data: newCurrentView,
        }),
});

export default connect(undefined, mapDispatchToProps)(DashboardMemoryAccesses);



