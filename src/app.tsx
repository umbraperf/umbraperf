import * as React from 'react';
import * as ReactDOM from 'react-dom';
import createProdStore from './model/store_prod';
import { IAppContext, AppContextProvider } from './app_context';

import { Provider as ReduxProvider } from 'react-redux';
import { Route, BrowserRouter, Switch, useLocation, Redirect, Link } from 'react-router-dom';

import './globals.css';
import styles from './style/main-app.module.css';

import FileUploader from './components/file_uploader';
import Dummy from './components/dummy';
import BarChart from './components/charts/bar_chart';
import SwimLanes from './components/charts/swim_lanes';
import TabPanel from './components/tab_panel';

import HelpIcon from '@material-ui/icons/Help';
import BackupIcon from '@material-ui/icons/Backup';
import AssessmentIcon from '@material-ui/icons/Assessment';
import SortIcon from '@material-ui/icons/Sort';
import { AppBar, Toolbar, Typography } from '@material-ui/core';
import { WebFileController } from './controller/web_file_controller';


//Create Redux stroe
const store = createProdStore();

//Create WorkerAPI
// const workerAPI = new WorkerAPI();
const webFileController = new WebFileController();

const appContext: IAppContext = {
    // worker: workerAPI,
    controller: webFileController,
};

const element = document.getElementById('root');

export const routes = [
    {
        path: '/',
        sidebarName: 'Start',
        component: Dummy,
        icon: () => { return (<HelpIcon />) },
    },
    {
        path: '/upload',
        sidebarName: 'Upload File',
        component: FileUploader,
        icon: () => { return (<BackupIcon />) },
    },
    {
        path: '/bar-chart',
        sidebarName: 'Bar Chart',
        component: BarChart,
        icon: () => { return (<AssessmentIcon />) },
    },
    {
        path: '/swim-lanes',
        sidebarName: 'Swim Lanes',
        component: SwimLanes,
        icon: () => { return (<SortIcon />) },
    },
    {
        path: '/dummy',
        sidebarName: 'Dummy',
        component: Dummy,
        icon: () => { return (<HelpIcon />) },
    },

];

ReactDOM.render(
    <AppContextProvider value={appContext}>
        <ReduxProvider store={store}>
            <BrowserRouter>

                {/*                 style: css module with additional static class (cloud also be a seccond module) */}
                <div className={`app ${styles.app}`}>

                    <div className="appHeader">
                        <AppBar position="static">
                            <Toolbar>
                                <Typography variant="h6" className={styles.appHeaderTitle}>
                                    Umbra-Profiler
                                </Typography>
                            </Toolbar>
                        </AppBar>
                    </div>

                    <div className="appBody">
                        <Switch>

                            <Route exact path="/">
                                <Redirect to="/upload" />
                            </Route>

                            {routes.map((route: any) => (
                                <Route exact path={route.path} key={route.path}>
                                    <route.component />
                                </Route>
                            ))}

                            <Route path="*">
                                <NoMatch />
                            </Route>

                        </Switch>
                    </div>

                    <div className="appNavigation">

                        <TabPanel></TabPanel>

                    </div>
                </div>

            </BrowserRouter>

        </ReduxProvider>
    </AppContextProvider>
    ,
    element,
);

function NoMatch() {
    let location = useLocation();

    return (
        <div>
            <h3>
                404: No subpage found for <code>{location.pathname}</code>.
                <br></br>
                You can return to homepage: <Link to={'/'} className="nav-link"> Home </Link>
            </h3>
        </div>
    );
}

export default store;
