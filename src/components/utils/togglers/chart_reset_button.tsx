import { IconButton, Zoom } from '@material-ui/core';
import DeleteSweepIcon from '@material-ui/icons/DeleteSweep';
import React from 'react';
import * as styles from '../../../style/utils.module.css';


interface Props {
    chartResetButtonFunction: () => void;
}

function ChartResetButton(props: Props) {

    const chartResetButtonClicked = () => {
        props.chartResetButtonFunction();
    }


    return (
        <Zoom in={true}>
            <IconButton
                className={styles.chartRestButton}
                onClick={() => chartResetButtonClicked()}
                size='small'
            >
                <DeleteSweepIcon />
            </IconButton>
        </Zoom>


    );
}


export default ChartResetButton;