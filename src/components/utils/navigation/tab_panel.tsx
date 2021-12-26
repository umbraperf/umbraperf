import * as model from '../../../model';
import React from 'react';
import { makeStyles, Theme } from '@material-ui/core/styles';
import AppBar from '@material-ui/core/AppBar';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import { withRouter, Link } from 'react-router-dom';
import { topLevelComponents } from '../../../app_config';
import { useSelector } from 'react-redux';


const useStyles = makeStyles((theme: Theme) => ({
    root: {
        backgroundColor: "#e0e0e0",
        flexGrow: 1,
        width: '100%',
        height: '38px',
        minHeight: '38px',
    },
    tabsDisabled: {
        color: 'white',
        pointerEvents: 'none',
        opacity: '0.4',
    },
    tabRoot: {
        height: '38px',
        minHeight: '38px',
    }
}));

function ScrollableTabsButtonForce(props: any) {

    const classes = useStyles();

    const umbraperfFileParsingFinished = useSelector((state: model.AppState) => state.umbraperfFileParsingFinished);

    return (
        <div className={classes.root}>
            <AppBar position="static" color="default">
                <Tabs
                    value={props.location.pathname === "/" ? "/upload" : props.location.pathname}
                    scrollButtons="on"
                    variant="fullWidth"
                    indicatorColor="secondary"
                    textColor="secondary"
                    aria-label="scrollable force tabs example"
                    className={umbraperfFileParsingFinished ? classes.root : `${classes.tabsDisabled} ${classes.root}`}
                >
                    {topLevelComponents.map((prop, key) => {
                        if (prop.path !== "/") {
                            return (
                                <Tab
                                    classes={{ root: classes.tabRoot }}
                                    value={prop.path}
                                    to={prop.path}
                                    icon={prop.icon()}
                                    component={Link} key={key}
                                />
                            );
                        }
                    })}
                </Tabs>
            </AppBar>
        </div>
    );
}

export default withRouter(ScrollableTabsButtonForce);

