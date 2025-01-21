import { FormControl, FormControlLabel, Switch, Typography } from '@material-ui/core';
import React from 'react';
import * as styles from '../../../style/utils.module.css';


interface Props {
    togglerState: boolean,
    togglerLabelText: string,
    uirViewerTogglerChangeFunction: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

function UirToggler(props: Props) {

    const handleUirTogglerChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        props.uirViewerTogglerChangeFunction(event);
    }


    return (
        <div>
            <FormControl
                component="fieldset"
                variant="standard">
                <FormControlLabel
                    control={
                        <Switch
                            checked={props.togglerState}
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


export default UirToggler;