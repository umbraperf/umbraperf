import { InputLabel, Select } from '@material-ui/core';
import MenuItem from '@material-ui/core/MenuItem';
import React from 'react';
import { connect } from 'react-redux';
import * as Context from '../../../app_context';
import * as Controller from '../../../controller';
import * as model from '../../../model';
import * as styles from "../../../style/utils.module.css";

interface BucketsizeDropdwnProps{
    disabled: boolean,
}

interface AppstateProps {
    appContext: Context.IAppContext;
    currentInterpolation: String;
}

type Props = AppstateProps & BucketsizeDropdwnProps;

function InterpolationDropdown(props: Props) {

    const interpolations = ["linear", "linear-closed", "step", "step-before", "step-after", "basis", "basis-open", "basis-closed", "cardinal", "cardinal-open", "cardinal-closed", "bundle", "monotone"];

    const handleOnItemClick = (elem: string) => {
        Controller.setCurrentInterpolation(elem);
    };


    return (
        <div className={styles.interpolationDropdownSelectorContainer}>
            <InputLabel className={styles.interpolationDropdownSelectorLabel} style={{ color: props.appContext.tertiaryColor }} id="interpolation-selector-label">Interpolation:</InputLabel>
            <Select className={styles.interpolationDropdownSelector}
                color="secondary"
                labelId="interpolation-selector-label"
                id="interpolation-selector"
                value={props.currentInterpolation}
                disabled={props.disabled}
            >
                {interpolations.map((elem, index) =>
                    (<MenuItem onClick={() => handleOnItemClick(elem)} key={index} value={elem}>{elem}</MenuItem>)
                )}
            </Select>

        </div>
    );
}

const mapStateToProps = (state: model.AppState) => ({
    currentInterpolation: state.currentInterpolation,
});

export default connect(mapStateToProps)(Context.withAppContext(InterpolationDropdown));