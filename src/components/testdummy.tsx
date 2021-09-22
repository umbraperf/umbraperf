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




interface Props {
    csvParsingFinished: boolean;
    setCurrentChart: (newCurrentChart: string) => void;
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

            <div className={styles.dropdownArea} >
                <InterpolationDropdown />
                <BucketsizeDropdwn />
            </div>
            <div>
                <DonutChart />
                <SwimLanesMultiplePipelines />
                <BarChart />
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



