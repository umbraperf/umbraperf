import * as model from '../model';
import React from 'react';
import styles from '../style/dummy.module.css';
import { Redirect } from 'react-router-dom';
import { connect } from 'react-redux';
import EventsButtons from './utils/events_buttons';
import InterpolationDropdown from './utils/interpolation_dropdown';
import BucketsizeDropdwn from './utils/bucketsize_dropdown';
import DonutChart from '../components/charts/donut_chart';
import SwimLanesMultiplePipelines from '../components/charts/swim_lanes_multiple_pipelines';
import BarChart from '../components/charts/bar_chart';
import BarChartActivityHistogram from '../components/charts/bar_chart_activity_histogram';
import PipelinesSelector from '../components/utils/pipelines_selector';
import { Grid } from '@material-ui/core';





interface Props {
    csvParsingFinished: boolean;
}

interface State {

}


class Dummy extends React.Component<Props, State> {


    constructor(props: Props) {
        super(props);
        this.state = {

        };

    }


    public render() {

        if (!this.props.csvParsingFinished) {
            return <Redirect to={"/upload"} />
        }

        return <div>

            <div >
                <Grid container spacing={0} >
                    <Grid item xs={7} >
                        <div className={styles.dummyGridCell}>
                            <EventsButtons />
                        </div>

                    </Grid>
                    <Grid item xs={5} >
                        <div className={styles.dummyGridCell} >
                            <InterpolationDropdown />
                            <BucketsizeDropdwn />
                        </div>

                    </Grid>
                </Grid>

                <Grid container spacing={0}>
                    <Grid item xs={12}>
                        <div className={styles.dummyGridCellChartContainer}>
                            <BarChartActivityHistogram />
                        </div>
                    </Grid>
                </Grid>

                <Grid container spacing={0}>
                    <Grid item xs={3}>
                        <div className={styles.dummyGridCellChartContainer}>
                            <DonutChart />
                        </div>
                    </Grid>
                    <Grid item xs={9}>
                        <div className={styles.dummyGridCellChartContainer}>
                            <SwimLanesMultiplePipelines />
                        </div>
                    </Grid>
                </Grid>

            </div>

            {/* 
                <Grid container spacing={2}>
                    <Grid item xs={3}>
                        <DonutChart />
                    </Grid>
                    <Grid item xs={9}>
                        <SwimLanesMultiplePipelines />
                    </Grid>
                </Grid>
                <Grid container spacing={2}>
                    <Grid item xs={3}>
                        <BarChart onDashboard={true} />
                    </Grid>
                    <Grid item xs={9}>
                        <SwimLanesMultiplePipelines absoluteValues={true} />
                    </Grid>
                </Grid> */}





        </div>;
    }


}

const mapStateToProps = (state: model.AppState) => ({

    csvParsingFinished: state.csvParsingFinished,
});


const mapDispatchToProps = (dispatch: model.Dispatch) => ({

});


export default connect(mapStateToProps, mapDispatchToProps)(Dummy);



