import * as model from '../../model/';
import React from 'react';
import MenuItem from '@material-ui/core/MenuItem';
import { InputLabel, Select } from '@material-ui/core';
import styles from "../../style/utils.module.css";
import { connect } from 'react-redux';


interface Props{
    currentInterpolation: String;
    setCurrentInterpolation: (newCurrentInterpolation: String) => void;
}


function InterpolationDropdown(props: Props) {

    const interpolations = ["linear", "linear-closed", "step", "step-before", "step-after", "basis", "basis-open", "basis-closed", "cardinal", "cardinal-open", "cardinal-closed", "bundle", "monotone"];

    const handleOnItemClick = (elem: string) => {
        props.setCurrentInterpolation(elem);
    };


    return (
        <div className={styles.interpolationDropdownSelectorContainer}>
            <InputLabel className={styles.interpolationDropdownSelectorLabel} id="interpolation-selector-label">Interpolation:</InputLabel>
            <Select className={styles.interpolationDropdownSelector}
                labelId="interpolation-selector-label"
                id="interpolation-selector"
                value={props.currentInterpolation}
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
 
 const mapDispatchToProps = (dispatch: model.Dispatch) => ({
    setCurrentInterpolation: (newCurrentInterpolation: String) => dispatch({
       type: model.StateMutationType.SET_CURRENTINTERPOLATION,
       data: newCurrentInterpolation,
    }),
 });

export default connect(mapStateToProps, mapDispatchToProps)(InterpolationDropdown);