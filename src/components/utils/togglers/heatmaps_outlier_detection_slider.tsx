import { FormControl, FormControlLabel, Slider, Tooltip, Typography } from '@material-ui/core';
import React from 'react';
import { connect } from 'react-redux';
import * as Context from '../../../app_context';
import * as Controller from '../../../controller';
import * as model from '../../../model';
import * as styles from '../../../style/utils.module.css';


interface Props {
    appContext: Context.IAppContext;
    memoryHeatmapsDifferenceRepresentation: boolean,
    currentHeatmapsOutlierDetection: model.HeatmapsOutlierDetectionDegrees,
}


function HeatmapsOutlierDetectionSlider(props: Props) {

    const getSliderValue = () => {
        return props.currentHeatmapsOutlierDetection;
    }

    const [value, setValue] = React.useState<model.HeatmapsOutlierDetectionDegrees>(getSliderValue());

    const valueText = (value: number): string => {
        const stepLables: { [outlierDetectionDegree: number]: string } = {
            0: "off",
            1: "very weak",
            2: "weak",
            3: "medium",
            4: "strong",
            5: "very strong",
        }
        return stepLables[value];
    }

    const handleChange = (event: object, newValue: number | number[]) => {
        setValue(newValue as model.HeatmapsOutlierDetectionDegrees);
    };

    const handleChangeCommitted = (event: any, newValue: number | number[]) => {
        //commit changes of slider to redux after mouseup
        Controller.handleHeatmapsOutlierDetectionSelection(value);
    }

    function ValueLabelComponent(props: any) {
        const { children, open, value } = props;

        return (
            <Tooltip open={open} enterTouchDelay={0} placement="bottom" title={valueText(value)}>
                {children}
            </Tooltip>
        );
    }


    return (
        <div className={styles.heatmapsOption}>
            <FormControl
                component="fieldset"
                variant="standard">
                <FormControlLabel
                    className={styles.formControlLabel}
                    control={
                        <Slider
                            className={styles.heatmapsOutlierDetectionSlider}
                            value={value}
                            marks
                            min={0}
                            max={5}
                            step={1}
                            onChange={handleChange}
                            onChangeCommitted={handleChangeCommitted}
                            valueLabelDisplay="auto"
                            ValueLabelComponent={ValueLabelComponent}
                            color='secondary'
                        />
                    }
                    label={
                        <Typography
                            className={styles.heatmapsOutlierDetectionSliderLabel}
                            variant="caption"
                        >
                            Outlier Detection Degree:
                        </Typography>
                    }
                    labelPlacement="start"
                />
            </FormControl>
        </div>
    );
}



const mapStateToProps = (state: model.AppState) => ({
    currentHeatmapsOutlierDetection: state.currentHeatmapsOutlierDetection,
    memoryHeatmapsDifferenceRepresentation: state.memoryHeatmapsDifferenceRepresentation,
});

export default connect(mapStateToProps)(Context.withAppContext(HeatmapsOutlierDetectionSlider));