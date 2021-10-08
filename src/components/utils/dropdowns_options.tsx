import React from 'react';
import styles from '../../style/spinner.module.css';
import InterpolationDropdown from '../utils/interpolation_dropdown';
import BucketsizeDropdwn from '../utils/bucketsize_dropdown';

function DropdownsOptions() {

    return <div className={styles.dropdownOptionsContainer}>
        <InterpolationDropdown />
        <BucketsizeDropdwn />
    </div>

}

export default DropdownsOptions;