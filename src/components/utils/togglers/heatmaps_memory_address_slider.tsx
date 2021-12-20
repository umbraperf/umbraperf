import * as model from '../../../model';
import * as Context from '../../../app_context';
import React from 'react';
import { connect } from 'react-redux';
import { FormControl, FormControlLabel, FormLabel, Switch, Typography } from '@material-ui/core';
import styles from '../../../style/utils.module.css';


interface AppstateProps {
    appContext: Context.IAppContext;
    currentMemoryAddressSelectionTuple: [number, number]
}

interface HeatmapsMemoryAddressSelectorProps{
    memoryAddressDomain: [number, number],
}

type Props = AppstateProps & HeatmapsMemoryAddressSelectorProps;


function HeatmapsMemoryAddressSelector(props: Props) {

    const handleHeatmapsDiffTogglerChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    }


    return (
        <div className={styles.HeatmapsDiffTogglerContainer}>
            <FormControl
                component="fieldset"
                variant="standard">
                <FormControlLabel
                    control={
                        <Switch
                            // checked={props.memoryHeatmapsDifferenceRepresentation}
                            onChange={handleHeatmapsDiffTogglerChange}
                            name="HeatmapsDiffToggler"
                            size="small"
                        />
                    }
                    label={
                        <Typography
                            className={styles.togglerLabel}
                            variant="caption"
                        >
                            Show Memory Access Differences:
                        </Typography>
                    }
                    labelPlacement="start"
                />
            </FormControl>
        </div>
    );
}

const mapStateToProps = (state: model.AppState) => ({
    currentMemoryAddressSelectionTuple: state.currentMemoryAddressSelectionTuple,
});

export default connect(mapStateToProps, undefined)(Context.withAppContext(HeatmapsMemoryAddressSelector));