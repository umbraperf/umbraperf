import * as model from '../../model';
import * as Context from '../../app_context';
import Spinner from './spinner';
import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { Button, FormControl, FormControlLabel, FormLabel, Switch } from '@material-ui/core';
import styles from '../../style/utils.module.css';


interface Props {
    appContext: Context.IAppContext;
    memoryHeatmapsDifferenceRepresentation: boolean,
    setMemoryHeatmapsDifferenceRepresentation: (newMemoryHeatmapsDifferenceRepresentation: boolean) => void;
}

function HeatmapsDiffToggler(props: Props) {

    const handleHeatmapsDiffTogglerChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        console.log(event.target.checked);
        props.setMemoryHeatmapsDifferenceRepresentation(event.target.checked);
    }


    return (
        <div className={styles.HeatmapsDiffTogglerContainer}>
            <FormControl component="fieldset" variant="standard">
                <FormControlLabel
                    control={
                        <Switch
                            checked={props.memoryHeatmapsDifferenceRepresentation}
                            onChange={handleHeatmapsDiffTogglerChange}
                            name="HeatmapsDiffToggler"
                            size="small"
                        />
                    }
                    label="Show Memory Access Differences: "
                    labelPlacement="start"
                />
            </FormControl>
        </div>
    );
}

const mapStateToProps = (state: model.AppState) => ({
    memoryHeatmapsDifferenceRepresentation: state.memoryHeatmapsDifferenceRepresentation,
});

const mapDispatchToProps = (dispatch: model.Dispatch) => ({
    setMemoryHeatmapsDifferenceRepresentation: (newMemoryHeatmapsDifferenceRepresentation: boolean) => dispatch({
        type: model.StateMutationType.SET_MEMORYHEATMAPSDIFFERENCEREPRESENTATION,
        data: newMemoryHeatmapsDifferenceRepresentation,
    }),

});

export default connect(mapStateToProps, mapDispatchToProps)(Context.withAppContext(HeatmapsDiffToggler));