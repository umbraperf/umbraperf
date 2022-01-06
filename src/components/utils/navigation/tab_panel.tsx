import * as model from '../../../model';
import * as Context from '../../../app_context';
import React from 'react';
import { makeStyles, Theme } from '@material-ui/core/styles';
import AppBar from '@material-ui/core/AppBar';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import { withRouter, Link } from 'react-router-dom';
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

interface Props {
    location: any;
    appContext: Context.IAppContext;
}

function ScrollableTabsButtonForce(props: Props) {

    const classes = useStyles();

    const umbraperfFileParsingFinished = useSelector((state: model.AppState) => state.umbraperfFileParsingFinished);

    const getActiveTopLevelComponent = () => {
        const currentTopLevelComponent = props.appContext.topLevelComponents.find(topLevelComponent => topLevelComponent.path === props.location.pathname);
        return currentTopLevelComponent ? currentTopLevelComponent.path : false;
    }

    return (
        <div className={classes.root}>
            <AppBar position="static" color="default">
                <Tabs
                    value={getActiveTopLevelComponent()}
                    scrollButtons="on"
                    variant="fullWidth"
                    indicatorColor="secondary"
                    textColor="secondary"
                    aria-label="scrollable force tabs example"
                    className={umbraperfFileParsingFinished ? classes.root : `${classes.tabsDisabled} ${classes.root}`}
                >
                    {props.appContext.topLevelComponents.map((topLevelComponent, key) => {
                        return (
                            <Tab
                                classes={{ root: classes.tabRoot }}
                                value={topLevelComponent.path}
                                to={topLevelComponent.path}
                                icon={topLevelComponent.icon()}
                                component={Link} key={key}
                            />
                        );
                    })}
                </Tabs>
            </AppBar>
        </div>
    );
}

export default withRouter(Context.withAppContext(ScrollableTabsButtonForce));

