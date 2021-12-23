import * as model from '../../../model';
import * as Controller from '../../../controller';
import * as Context from '../../../app_context';
import React from 'react';
import { connect } from 'react-redux';
import { FormControl, FormControlLabel, Slider, Tooltip, Typography } from '@material-ui/core';
import styles from '../../../style/utils.module.css';


interface Props {
    appContext: Context.IAppContext;
    memoryHeatmapsDifferenceRepresentation: boolean,
    currentHeatmapsOutlierDetection: model.HeatmapsOutlierDetectionDegrees,
}


function HeatmapsOutlierDetectionSlider(props: Props) {

    const getSliderScale = () => {
        //TODO remove? 
        return ['off', 'very weak', 'weak', 'medium', 'strong', 'very strong'];
    }

    const getSliderValue = () => {
        return props.currentHeatmapsOutlierDetection;
    }

    const [value, setValue] = React.useState<model.HeatmapsOutlierDetectionDegrees>(getSliderValue());

    const valueText = (value: number): string => {
        return "" + value;
    }

    const isSliderDisabled = () => {
        return props.memoryHeatmapsDifferenceRepresentation;
    }

    const handleChange = (event: object, newValue: number | number[]) => {
        setValue(newValue as model.HeatmapsOutlierDetectionDegrees);
    };

    const handleChangeCommitted = (event: any, newValue: number | number[]) => {
        //commit changes of slider to redux after mouseup
        // Controller.handleHeatmapsOutlierDetectionSelection(value);
    }

    function ValueLabelComponent(props: any) {
        const { children, open, value } = props;

        return (
            <Tooltip open={open} enterTouchDelay={0} placement="bottom" title={value}>
                {children}
            </Tooltip>
        );
    }


    return (
        <div className={styles.heatmapsOutlierDetectionSliderContainer}>
            <FormControl
                component="fieldset"
                variant="standard">
                <FormControlLabel
                    control={
                        <Slider
                            disabled={isSliderDisabled()}
                            value={value}
                            marks
                            min={0}
                            max={6}
                            step={1}
                            onChange={handleChange}
                            onChangeCommitted={handleChangeCommitted}
                            valueLabelDisplay="auto"
                            aria-labelledby="range-slider"
                            getAriaValueText={(value: number) => valueText(value)}
                            ValueLabelComponent={ValueLabelComponent}
                            color='secondary'
                        />
                    }
                    label={
                        <Typography
                            className={styles.heatmapsOutlierDetectionSliderLabel}
                            variant="caption"
                            id="range-slider"
                        />
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