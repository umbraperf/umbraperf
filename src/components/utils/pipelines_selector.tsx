import React, { useContext, useEffect } from 'react';
import { connect } from 'react-redux';
import { ctx } from '../../app_context';
import * as model from '../../model';
import { Button, Checkbox, FormControlLabel, FormGroup } from '@material-ui/core';
import { requestPipelines } from '../../controller/web_file_controller';

interface Props {
    pipelines: Array<string> | undefined;
    currentPipeline: Array<string> | undefined;
    setCurrentPipeline: (newCurrentPipeline: Array<string>) => void;
}

function PipelinesSelector(props: Props) {

    const context = useContext(ctx);
    const pipelines = props.pipelines;
    if (undefined === pipelines) {
        requestPipelines(context!.controller);
    }
    useEffect(() => {
        if (pipelines && undefined === props.currentPipeline) {
            props.setCurrentPipeline(new Array<string>().concat(pipelines));
        }
    });

    const createPipelineShortString = (pipeline: string) => {
        return pipeline.length > 30 ? (pipeline.substr(0, 27) + "...") : pipeline;
    }

    const isBoxChecked = (pipeline: string) => {
        if (props.currentPipeline?.includes(pipeline)) {
            return true;
        } else {
            return false;
        }
    }

    const checkBoxClicked = (event: any, pipeline: string) => {
        if (event.target.checked === false) {
            props.setCurrentPipeline(props.currentPipeline!.filter(e => e !== pipeline));
        } else {
            props.setCurrentPipeline(props.currentPipeline?.concat(pipeline)!);
        }

    }

    return (
        <div className={"eventButtonsArea"}>
            <FormGroup>
                {pipelines && pipelines!.map((pipeline: string, index: number) => (
                    <FormControlLabel
                        key={index}
                        control={
                            <Checkbox
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