//depreciated, use sunburst

import * as model from '../../model';
import React, { useContext } from 'react';
import { connect } from 'react-redux';
import { Checkbox, FormControlLabel, FormGroup } from '@material-ui/core';
import styles from '../../style/utils.module.css';

interface Props {
    pipelines: Array<string> | undefined;
    currentPipeline: Array<string> | "All";
    setCurrentPipeline: (newCurrentPipeline: Array<string>) => void;
}

function PipelinesSelector(props: Props) {

    const pipelines = props.pipelines;

    const createPipelineShortString = (pipeline: string) => {
        return pipeline.length > 50 ? (pipeline.substr(0, 47) + "...") : pipeline;
    }

    const isBoxChecked = (pipeline: string) => {
        if (props.currentPipeline === "All") {
            return true
        } else if (props.currentPipeline?.includes(pipeline)) {
            return true;
        } else {
            return false;
        }
    }

    const checkBoxClicked = (event: any, selectedPipeline: string) => {
        if (props.currentPipeline === "All") {
            props.setCurrentPipeline(props.pipelines!.filter(e => e !== selectedPipeline));
        } else {
            if (props.currentPipeline.includes(selectedPipeline)) {
                props.setCurrentPipeline(props.currentPipeline.filter(e => e !== selectedPipeline));
            } else {
                props.setCurrentPipeline(props.currentPipeline!.concat(selectedPipeline));
            }
        }
    }

    return (
        <div className={styles.pipelinesSelectorArea}>
            <FormGroup>
                {pipelines && pipelines!.map((pipeline: string, index: number) => (
                    <FormControlLabel
                        className={styles.pipelinesSelectorFormControlLabel}
                        key={index}
                        control={
                            <Checkbox
                                color="primary"
                                checked={isBoxChecked(pipeline)}
                                onChange={(event) => checkBoxClicked(event, pipeline)}
                            />}
                        label={createPipelineShortString(pipeline)}
                    />
                ))}
            </FormGroup>

        </div>
    );
}

const mapStateToProps = (state: model.AppState) => ({
    pipelines: state.pipelines,
    currentPipeline: state.currentPipeline,
});

const mapDispatchToProps = (dispatch: model.Dispatch) => ({
    setCurrentPipeline: (newCurrentPipeline: Array<string>) => dispatch({
        type: model.StateMutationType.SET_CURRENTPIPELINE,
        data: newCurrentPipeline,
    }),
});

export default connect(mapStateToProps, mapDispatchToProps)(PipelinesSelector)