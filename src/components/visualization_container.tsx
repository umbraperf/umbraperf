import React from "react";
import { connect } from "react-redux";
import * as model from '../model';
import styles from '../style/charts.module.css';

import EventsButtons from './utils/events_buttons';

import BarChart from '../components/charts/bar_chart';
import Dummy from '../components/testdummy';
import SwimLanes from '../components/charts/swim_lanes';
import SwimLanesPipelines from '../components/charts/swim_lanes_pipelines';
import SwimLanesMultiplePipelines from '../components/charts/swim_lanes_multiple_pipelines';
import DonutChart from '../components/charts/donut_chart';
import { Redirect } from "react-router";
import InterpolationDropdown from "./utils/interpolation_dropdown";
import BucketsizeDropdwn from "./utils/bucketsize_dropdown";


interface State {

}

interface Props {
    csvParsingFinished: boolean;
    component: React.ComponentClass;
    visualizationName: string;
}

class VisualizationContainer extends React.Component<Props, State> {

    constructor(props: Props) {
        super(props);
        this.state = {
        };
    }

    needsSwimLanesOptions() {
        if (this.props.visualizationName === "/swim-lanes" ||
            this.props.visualizationName === "/swim-lanes-pipelines" ||
            this.props.visualizationName === "/swim-lanes-multiple-pipelines") {
            return true;
        }
        return false;
    }

    public render() {


        if (!this.props.csvParsingFinished) {
            return <Redirect to={"/upload"} />
        }

        return <div>
            <div className={styles.resultArea} >

                <div className={styles.optionsArea} >
                    <EventsButtons />
                    {this.needsSwimLanesOptions() &&
                        <div className={styles.dropdownArea} >
{/*                             <InterpolationDropdown {...interpolationDropdownProps}></InterpolationDropdown>
                            <BucketsizeDropdwn {...bucketsizeDropdownProps}></BucketsizeDropdwn> */}
                        </div>
                    }
                </div>
                <div>
                    {React.createElement(this.props.component)}
                </div>
            </div>

        </div>

    }

}

const mapStateToProps = (state: model.AppState) => ({
    csvParsingFinished: state.csvParsingFinished,

});


const mapDispatchToProps = (dispatch: model.Dispatch) => ({

});


export default connect(mapStateToProps, mapDispatchToProps)(VisualizationContainer);