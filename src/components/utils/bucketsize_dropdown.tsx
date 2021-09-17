import React from 'react';
import MenuItem from '@material-ui/core/MenuItem';
import { InputLabel, Select } from '@material-ui/core';
import styles from "../../style/utils.module.css";


export default function BucketsizeDropdwn(props: any) {

    const bucketsizes = [0.1, 0.2, 0.5, 0.7, 1, 2.5, 5, 7.5, 10];

    const handleOnItemClick = (elem: number) => {
        props.changeBucketsize(elem);
    };


    return (
        <div className={styles.bucketsizeDropdownSelectorContainer}>
            <InputLabel className={styles.bucketsizeDropdownSelectorLabel} id="bucketsize-selector-label">Choose Bucket-Size:</InputLabel>
            <Select className={styles.bucketsizeDropdownSelector}
                labelId="bucketsize-selector-label"
                id="bucketsize-selector"
                value={props.currentBucketsize}
            >
                {bucketsizes.map((elem, index) =>
                    (<MenuItem onClick={() => handleOnItemClick(elem)} key={index} value={elem}>{elem}</MenuItem>)
                )}
            </Select>

        </div>
    );
}