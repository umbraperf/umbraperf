import React from 'react';
import MenuItem from '@material-ui/core/MenuItem';
import { InputLabel, Select } from '@material-ui/core';
import styles from "../../style/utils.module.css";


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