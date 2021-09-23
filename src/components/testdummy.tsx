import * as model from '../model';
import React from 'react';
import styles from '../style/charts.module.css';
import { Redirect } from 'react-router-dom';
import { connect } from 'react-redux';
import InterpolationDropdown from './utils/interpolation_dropdown';
import BucketsizeDropdwn from './utils/bucketsize_dropdown';
import DonutChart from '../components/charts/donut_chart';
import SwimLanesMultiplePipelines from '../components/charts/swim_lanes_multiple_pipelines';
import BarChart from '../components/charts/bar_chart';
import BarChartActivityHistogram from '../components/charts/bar_chart_activity_histogram';
import { Grid } from '@material-ui/core';





interface Props {
    csvParsingFinished: boolean;
    setCurrentChart: (newCurrentChart: string) => void;
}

interface State {

}

const dummyStyle = {
    display: "flex",
    flexWrap: "wrap" as const,
    justifyContent: "center",
    //alignItems: "center",
    marginTop: 30,
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
                <Grid container spacing={2}>
                    <Grid item xs>
                        <div className={styles.dropdownArea} >
                            <InterpolationDropdown />
                            <BucketsizeDropdwn />
                        </div>
                    </Grid>

                </Grid>
                <Grid container spacing={2}>
                    <Grid item xs>
                        <BarChartActivityHistogram />
                    </Grid>
                </Grid>
                <Grid container spacing={2}>
                    <Grid item xs>
                        <div style={{ background: "black" }}> 1</div>
                    </Grid>
                    <Grid item xs>
                        <div style={{ background: "black" }}> 2 </div>
                    </Grid>
                    <Grid item xs>
                        <div style={{ background: "black" }}> 3 </div>
                    </Grid>
                    <Grid item xs>
                        <div style={{ background: "black" }}> 4 </div>
                    </Grid>
                </Grid>
            </div>

            <div style={dummyStyle}>
                <DonutChart />
                <SwimLanesMultiplePipelines />
                <BarChart onDashboard={true} />
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



