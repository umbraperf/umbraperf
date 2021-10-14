import React from "react";
import { connect } from "react-redux";
import * as model from '../model';
import styles from '../style/charts.module.css';

import EventsButtons from './utils/events_buttons';

import { Redirect } from "react-router";
import InterpolationDropdown from "./utils/interpolation_dropdown";
import BucketsizeDropdwn from "./utils/bucketsize_dropdown";
import PipelinesSelector from "./utils/pipelines_selector";


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
            this.props.visualizationName === "/swim-lanes-multiple-pipelines" ||
            this.props.visualizationName === "/swim-lanes-multiple-pipelines-combined") {
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
                            <InterpolationDropdown />
                            <BucketsizeDropdwn />
                        </div>
                    }
                </div>
                <div>
                    {this.props.visualizationName === "/swim-lanes-multiple-pipelines-combined"
                        ?
                        <div>
                            {React.createElement(this.props.component, null)}
                            {React.createElement(this.props.component, { absoluteValues: true } as any)}
                            <PipelinesSelector />
                        </div>
                        :
                        React.createElement(this.props.component)}
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