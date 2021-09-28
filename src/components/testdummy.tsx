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
import { Grid } from '@material-ui/core';





interface Props {
    csvParsingFinished: boolean;
}

interface State {

}


class Dummy extends React.Component<Props, State> {


    constructor(props: Props) {
        super(props);

    }


    public render() {

        if (!this.props.csvParsingFinished) {
            return <Redirect to={"/upload"} />
        }

        return <div>

            <div >
                <Grid container spacing={0} className={styles.dummyGridOptionsContainer} >
                    <Grid item xs={12} lg={7} >
                        <div className={styles.dummyGridCell}>
                            <EventsButtons />
                        </div>

                    </Grid>
                    <Grid item xs={12} lg={5} >
                        <div className={styles.dummyGridCell} >
                            <InterpolationDropdown />
                            <BucketsizeDropdwn />
                        </div>

                    </Grid>
                </Grid>

                <Grid container spacing={0}>
                    <Grid item md={12} lg={12}>
                        <div className={styles.dummyGridCellChartContainer}>
                            <BarChartActivityHistogram />
                        </div>
                    </Grid>

                    <Grid item xs={5} lg={3}>
                        <div className={styles.dummyGridCellChartContainer}>
                            <DonutChart />
                        </div>
                    </Grid>
                    <Grid item sm={12} lg={9}>
                        <div className={styles.dummyGridCellChartContainer}>
                            <SwimLanesMultiplePipelines />
                        </div>
                    </Grid>

                    <Grid item xs={5} lg={3}>
                        <div className={styles.dummyGridCellChartContainer}>
                            <BarChart onDashboard={true} />
                        </div>
                    </Grid>
                    <Grid item sm={12} lg={9}>
                        <div className={styles.dummyGridCellChartContainer}>
                            <SwimLanesMultiplePipelines absoluteValues={true} />
                        </div>
                    </Grid>
                    
                </Grid>

            </div>


        </div>;
    }


}

const mapStateToProps = (state: model.AppState) => ({

    csvParsingFinished: state.csvParsingFinished,
});


const mapDispatchToProps = (dispatch: model.Dispatch) => ({

});


export default connect(mapStateToProps, mapDispatchToProps)(Dummy);



