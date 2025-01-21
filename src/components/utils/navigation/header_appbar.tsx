import { AppBar, Toolbar, Typography } from '@material-ui/core';
import React from 'react';
import * as styles from "../../../style/utils.module.css";
import ProfilesDropdown from '../dropdowns/profiles_menu';
import TpchMenu from '../dropdowns/tpch_menu';
import StatusIndicator from './status_indicator';

import umbraProfilerLogo from '../../../../images/umbra-profiler_logo.png';

function HeaderAppbar() {

    return (
        <AppBar
            className={styles.appbar}
            position="static"
        >
            <Toolbar
                className={styles.appbarToolbar}
            >
                <div className={styles.appbarToolbarLogoContainer}>
                    <img
                        className={styles.appbarToolbarLogo}
                        src={umbraProfilerLogo}
                        alt="logo">
                    </img>
                </div>
                <Typography variant="h6">
                    Umbra-Profiler
                </Typography>

                <div className={styles.appbarToolbarOptionsContainer}>
                    <TpchMenu />
                    <ProfilesDropdown />
                    <StatusIndicator />
                </div>
            </Toolbar>
        </AppBar>
    );
}

export default HeaderAppbar;