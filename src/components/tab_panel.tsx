import React from 'react';
import { makeStyles, Theme } from '@material-ui/core/styles';
import AppBar from '@material-ui/core/AppBar';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import HelpIcon from '@material-ui/icons/Help';
import Typography from '@material-ui/core/Typography';
import Box from '@material-ui/core/Box';

import { AppState } from '../model/state';

import { withRouter, Link } from 'react-router-dom';
import { routes } from '../app';
import { useSelector } from 'react-redux';


function a11yProps(index: any) {
    return {
        id: `scrollable-force-tab-${index}`,
        'aria-controls': `scrollable-force-tabpanel-${index}`,
    };
}

const useStyles = makeStyles((theme: Theme) => ({
    root: {
        flexGrow: 1,
        width: '100%',
        backgroundColor: theme.palette.background.paper,
    },
    tabsDisabled: {
        color: 'white',
        pointerEvents: 'none',
        opacity: '0.4',
    }

}));

function ScrollableTabsButtonForce(props: any) {
    const classes = useStyles();
    const [value, setValue] = React.useState(-1);

    const handleChange = (event: React.ChangeEvent<{}>, newValue: number) => {
        setValue(newValue);
    };

    const eventsLoading = useSelector((state: AppState) => state.eventsLoading);
    const events = useSelector((state: AppState) => state.events);

    return (
        <div className={classes.root}>
            <AppBar position="static" color="default">
                <Tabs
                    centered={true}
                    value={props.location.pathname}
                    onChange={handleChange}
                    variant="scrollable"
                    scrollButtons="on"
                    indicatorColor="primary"
                    textColor="primary"
                    aria-label="scrollable force tabs example"
                    className={(eventsLoading || events === undefined) ? classes.tabsDisabled : ""}
                >
                    {routes.map((prop, key) => {
                        if (prop.path !== "/") {
                            return (
                                <Tab label={prop.sidebarName} value={prop.path} to={prop.path} icon={prop.icon()} component={Link} key={key} />
                            );
                        }
                    })}
                    <Tab label="DummyButton" icon={<HelpIcon />} {...a11yProps(6)} />
                </Tabs>
            </AppBar>
        </div>
    );
}

export default withRouter(ScrollableTabsButtonForce);

