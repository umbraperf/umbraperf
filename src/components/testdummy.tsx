import * as model from '../model';
import React from 'react';
import { Vega } from 'react-vega';
import { VisualizationSpec } from "react-vega/src";
import styles from '../style/charts.module.css';
import { Redirect } from 'react-router-dom';
import { createRef } from 'react';
import { connect } from 'react-redux';
import { ChartType } from '../controller/web_file_controller';
import PipelinesSelector from './utils/pipelines_selector';
import DonutChart from '../components/charts/donut_chart';
import SwimLanesMultiplePipelines from '../components/charts/swim_lanes_multiple_pipelines';




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

    componentDidUpdate(prevProps: Props): void {

    }


    componentDidMount() {

    }


    public render() {

        if (!this.props.csvParsingFinished) {
            return <Redirect to={"/upload"} />
        }

        return <div>
            <div className={styles.resultArea} >

                <div>
                    <DonutChart />
                    <SwimLanesMultiplePipelines />

                </div>

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



