import React from 'react';
import { FormControl, FormControlLabel, FormLabel, Switch, Typography } from '@material-ui/core';
import styles from '../../../style/utils.module.css';


interface Props {
    uirLinesFolded: boolean,
    uirViewerHandleLinesFoldedChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

function UirLinesFoldedToggler(props: Props) {

    const handleUirLinesFoldedTogglerChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        props.uirViewerHandleLinesFoldedChange(event);
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
                            onChange={handleUirLinesFoldedTogglerChange}
                            name="HeatmapsDiffToggler"
                            size="small"
                        />
                    }
                    label={
                        <Typography
                            className={styles.togglerLabel}
                            variant="caption"
                        >
                            Fold Lines: 
                        </Typography>
                    }
                    labelPlacement="start"
                />
            </FormControl>
        </div>
    );
}


export default UirLinesFoldedToggler;