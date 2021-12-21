import * as model from '../../../model';
import * as Controller from '../../../controller';
import * as Context from '../../../app_context';
import React from 'react';
import { connect } from 'react-redux';
import { Slider, Tooltip, Typography } from '@material-ui/core';
import styles from '../../../style/utils.module.css';


interface AppstateProps {
    appContext: Context.IAppContext;
    memoryHeatmapsDifferenceRepresentation: boolean,
    currentMemoryAddressSelectionTuple: [number, number]
}

interface HeatmapsMemoryAddressSelectorProps {
    memoryAddressDomain: [number, number],
}

type Props = AppstateProps & HeatmapsMemoryAddressSelectorProps;


function HeatmapsMemoryAddressSelector(props: Props) {

    const getSliderValue = (): [number, number] => {
        return [props.currentMemoryAddressSelectionTuple[0] === -1 ? props.memoryAddressDomain[0] : props.currentMemoryAddressSelectionTuple[0],
        props.currentMemoryAddressSelectionTuple[1] === -1 ? props.memoryAddressDomain[1] : props.currentMemoryAddressSelectionTuple[1]]
    }

    const [value, setValue] = React.useState<[number, number]>(getSliderValue());

    const valueText = (value: number): string => {
        return "" + value;
    }

    const isSliderDisabled = () => {
        return props.memoryHeatmapsDifferenceRepresentation;
    }

    const handleChange = (event: any, newValue: number | number[]) => {
        setValue(Array.isArray(newValue) ? [newValue[0], newValue[1]] : [newValue, newValue]);
    };

    const handleChangeCommitted = (event: any, newValue: number | number[]) => {
        //commit changes of slider to redux after mouseup
        Controller.handleMemoryAddressSelectionTuple(value);
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
        <div className={styles.heatmapsMemoryAddressSelectorContainer}>
            <Typography
                className={styles.heatmapsMemoryAddrressSelectorTogglerLabel}
                variant="caption"
                id="range-slider"
            >
                Select Memory Address Range:
            </Typography>
            <Slider
                disabled={isSliderDisabled()}
                value={value}
                onChange={handleChange}
                onChangeCommitted={handleChangeCommitted}
                valueLabelDisplay="auto"
                aria-labelledby="range-slider"
                getAriaValueText={(value: number) => valueText(value)}
                min={props.memoryAddressDomain[0]}
                max={props.memoryAddressDomain[1]}
                ValueLabelComponent={ValueLabelComponent}
                color='secondary'
            />
        </div>
    );
}



const mapStateToProps = (state: model.AppState) => ({
    currentMemoryAddressSelectionTuple: state.currentMemoryAddressSelectionTuple,
    memoryHeatmapsDifferenceRepresentation: state.memoryHeatmapsDifferenceRepresentation,
});

export default connect(mapStateToProps)(Context.withAppContext(HeatmapsMemoryAddressSelector));