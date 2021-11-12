import * as model from '../../model';
import React from 'react';
import styles from '../../style/dashboard.module.css';
import { Redirect } from 'react-router-dom';
import { connect } from 'react-redux';
import EventsButtons from '../utils/events_buttons';
import KpiContainer from '../utils/kpi_container';
import DropdownsOptions from '../utils/dropdowns_options';
import { Grid, Box } from '@material-ui/core';


interface Props {
    csvParsingFinished: boolean;
}


class DashboardHeader extends React.Component<Props, {}> {


    constructor(props: Props) {
        super(props);
    }

    public render() {

        if (!this.props.csvParsingFinished) {
            return <Redirect to={"/upload"} />
        }

        return <Grid container>
            <Box clone order={{ xs: 1, lg: 1, xl: 1 }}>
                <Grid item className={styles.dashboardGridCellOptionsItem} xs={12} lg={8} xl={5}>
                    <Box className={styles.dashboardGridCellOptionsBox}>
                        <EventsButtons/>
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
        </Grid>;
    }


}

const mapStateToProps = (state: model.AppState) => ({
    csvParsingFinished: state.csvParsingFinished,
});



export default connect(mapStateToProps)(DashboardHeader);



