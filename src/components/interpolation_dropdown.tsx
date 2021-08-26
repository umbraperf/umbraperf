import React, { useCallback, useContext } from 'react';
import { createStyles, makeStyles, Theme, withStyles } from '@material-ui/core/styles';
import MenuItem from '@material-ui/core/MenuItem';
import { useDispatch, useSelector } from 'react-redux';
import { AppState } from '../model/state';
import { ctx } from '../app_context';
import * as model from '../model';
import { FormControl } from 'react-bootstrap';
import { InputLabel, Select } from '@material-ui/core';
import styles from "../style/dropdown.module.css";


export default function InterpolationDropdown(props: any) {

    const interpolations = ["linear", "linear-closed", "step", "step-before", "step-after", "basis", "basis-open", "basis-closed", "cardinal", "cardinal-open", "cardinal-closed", "bundle", "monotone"];

    const handleOnItemClick = (elem: string) => {
        props.changeInterpolation(elem);
    };


    return (
        <div className={styles.interpolationDropdownSelectorContainer}>
            <InputLabel className={styles.interpolationDropdownSelectorLabel} id="interpolation-selector-label">Choose Interpolation:</InputLabel>
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