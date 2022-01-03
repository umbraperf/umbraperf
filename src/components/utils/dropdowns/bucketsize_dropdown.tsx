import * as model from '../../../model';
import * as Controller from '../../../controller';
import * as Context from '../../../app_context';
import React from 'react';
import MenuItem from '@material-ui/core/MenuItem';
import { InputLabel, Select } from '@material-ui/core';
import styles from "../../../style/utils.module.css";
import { connect } from 'react-redux';

interface BucketsizeDropdwnProps{
    disabled: boolean,
}

interface AppstateProps {
    appContext: Context.IAppContext;
    currentBucketSize: number;
}

type Props = AppstateProps & BucketsizeDropdwnProps;

function BucketsizeDropdwn(props: Props) {

    const bucketsizes = [0.1, 0.2, 0.5, 0.7, 1, 2.5, 5, 7.5, 10, 50, 100];

    const handleOnItemClick = (elem: number) => {
        Controller.setCurrentBucketSize(elem);
    };


    return (
        <div className={styles.bucketsizeDropdownSelectorContainer}>
            <InputLabel className={styles.bucketsizeDropdownSelectorLabel} style={{ color: props.appContext.tertiaryColor }} id="bucketsize-selector-label">Bucket-Size:</InputLabel>
            <Select className={styles.bucketsizeDropdownSelector}
                color="secondary"
                labelId="bucketsize-selector-label"
                id="bucketsize-selector"
                value={props.currentBucketSize}
                disabled={props.disabled}
            >
                {bucketsizes.map((elem, index) =>
                    (<MenuItem onClick={() => handleOnItemClick(elem)} key={index} value={elem}>{elem}</MenuItem>)
                )}
            </Select>

        </div>
    );
}

const mapStateToProps = (state: model.AppState) => ({
    currentBucketSize: state.currentBucketSize,
});

export default connect(mapStateToProps)(Context.withAppContext(BucketsizeDropdwn));