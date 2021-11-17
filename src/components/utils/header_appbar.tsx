import React from 'react';
import styles from "../../style/utils.module.css";
import { AppBar, Toolbar, Typography } from '@material-ui/core';
import StatusIndicator from './status_indicator';

function HeaderAppbar() {

    return (
        <AppBar
            className={styles.appbar}
            position="static"
        >
            <Toolbar
                className={styles.appbarToolbar}
            >
                <Typography variant="h6">
                    Umbra-Profiler
                </Typography>

                <div className={styles.appbarToolbarStatusContainer}>
                    <StatusIndicator />
                </div>
            </Toolbar>
        </AppBar>
    );
}

export default HeaderAppbar;