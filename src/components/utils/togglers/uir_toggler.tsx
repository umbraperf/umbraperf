import React from 'react';
import { FormControl, FormControlLabel, Switch, Typography } from '@material-ui/core';
import styles from '../../../style/utils.module.css';


interface Props {
    uirLinesFolded: boolean,
    togglerLabelText: string,
    uirViewerTogglerChangeFunction: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

function UirLinesFoldedToggler(props: Props) {

    const handleUirTogglerChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        props.uirViewerTogglerChangeFunction(event);
    }


    return (
        <div className={styles.HeatmapsDiffTogglerContainer}>
            <FormControl
                component="fieldset"
                variant="standard">
                <FormControlLabel
                    control={
                        <Switch
                            checked={props.uirLinesFolded}
                            onChange={handleUirTogglerChange}
                            name="HeatmapsDiffToggler"
                            size="small"
                        />
                    }
                    label={
                        <Typography
                            className={styles.togglerLabel}
                            variant="caption"
                        >
                            {props.togglerLabelText}
                        </Typography>
                    }
                    labelPlacement="start"
                />
            </FormControl>
        </div>
    );
}


export default UirLinesFoldedToggler;