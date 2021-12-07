import React from 'react';
import {IconButton } from '@material-ui/core';
import styles from '../../../style/utils.module.css';
import DeleteSweepIcon from '@material-ui/icons/DeleteSweep';


interface Props {
    chartResetButtonFunction: () => void;
}

function ChartResetButton(props: Props) {

    const chartResetButtonClicked = () => {
        props.chartResetButtonFunction();
    }


    return (
        <IconButton
            className={styles.chartRestButton}
            onClick={() => chartResetButtonClicked()}
            // style={{ position: "absolute", left: 20, marginTop: -9, zIndex: 2 }}
        >
            <DeleteSweepIcon />
        </IconButton>
    );
}


export default ChartResetButton;