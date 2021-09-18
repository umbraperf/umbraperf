import React, { useCallback } from 'react';
import { makeStyles, Theme } from '@material-ui/core/styles';
import AppBar from '@material-ui/core/AppBar';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';

import { AppState } from '../../model/state';
import * as model from '../../model';

import { withRouter, Link } from 'react-router-dom';
import { routes } from '../../app';
import { useDispatch, useSelector } from 'react-redux';


const useStyles = makeStyles((theme: Theme) => ({
    root: {
        backgroundColor: "#e0e0e0",
        flexGrow: 1,
        width: '100%',
        height: '32px',
        minHeight: '32px',
        //backgroundColor: theme.palette.background.default,
        //backgroundColor: theme.palette.background.paper,
    },
    tabsDisabled: {
        color: 'white',
        pointerEvents: 'none',
        opacity: '0.4',
    },
    tabRoot: {
        height: '32px',
        minHeight: '32px',
        //minWidth: '200px',
    }
}));


function ScrollableTabsButtonForce(props: any) {

    const classes = useStyles();

    const csvParsingFinished = useSelector((state: AppState) => state.csvParsingFinished);

    return (
        <div className={classes.root}>
            <AppBar position="static" color="default">
                <Tabs
                    value={props.location.pathname}
                    variant="scrollable"
                    scrollButtons="on"
/*                     variant="fullWidth"
 */                    indicatorColor="primary"
                    textColor="primary"
                    aria-label="scrollable force tabs example"
                    className={csvParsingFinished ? classes.root : `${classes.tabsDisabled} ${classes.root}`}
                >
                    {routes.map((prop, key) => {
                        if (prop.path !== "/") {
                            return (
                                <Tab classes={{ root: classes.tabRoot }} /* label={prop.sidebarName} */ value={prop.path} to={prop.path} icon={prop.icon()} component={Link} key={key} />
                            );
                        }
                    })}
                </Tabs>
            </AppBar>
        </div>
    );
}

export default withRouter(ScrollableTabsButtonForce);

