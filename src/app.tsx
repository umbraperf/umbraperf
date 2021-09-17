import * as React from 'react';
import * as ReactDOM from 'react-dom';
import createProdStore from './model/store_prod';
import createDevStore from './model/store_dev';
import { IAppContext, AppContextProvider } from './app_context';

import { Provider as ReduxProvider } from 'react-redux';
import { Route, BrowserRouter, Switch, useLocation, Redirect, Link } from 'react-router-dom';

import './globals.css';
import '../node_modules/react-grid-layout/css/styles.css';
import '../node_modules/react-resizable/css/styles.css';
import styles from './style/main-app.module.css';

import FileUploader from './components/file_uploader';
import Dashboard from './components/dashboard'
import BarChart from './components/charts/bar_chart';
import DonutChart from './components/testdummy';
import SwimLanes from './components/charts/swim_lanes';
import SwimLanesPipelines from './components/charts/swim_lanes_pipelines';
import TabPanel from './components/utils/tab_panel';

import HelpIcon from '@material-ui/icons/Help';
import BackupIcon from '@material-ui/icons/Backup';
import AssessmentIcon from '@material-ui/icons/Assessment';
import SortIcon from '@material-ui/icons/Sort';
import DashboardIcon from '@material-ui/icons/Dashboard';
import ViewHeadlineIcon from '@material-ui/icons/ViewHeadline';
import { AppBar, createTheme, MuiThemeProvider, Toolbar, Typography } from '@material-ui/core';
import { WebFileController } from './controller/web_file_controller';
import { Shadows } from '@material-ui/core/styles/shadows';


//Create Redux stroe
//TODO change to prod store
//export const store = createProdStore();
export const store = createDevStore();

//Create WorkerAPI
// const workerAPI = new WorkerAPI();
const webFileController = new WebFileController();

const appColor = {
    primary: '#198fb0',
    secondary: '#919191',
}

export const appContext: IAppContext = {
    controller: webFileController,
    primaryColor: appColor.primary,
    secondaryColor: appColor.secondary,

};

const materialUiTheme = createTheme({
    shadows: Array(25).fill("none") as Shadows,
    palette: {
        primary: {
            main: appColor.primary
        },
        secondary: {
            main: appColor.secondary
        }
    }
})

const element = document.getElementById('root');

export const routes = [
    {
        path: '/upload',
        sidebarName: 'Upload File',
        component: FileUploader,
        icon: () => { return (<BackupIcon />) },
    },
    {
        path: '/dashboard',
        sidebarName: 'Dashboard',
        component: Dashboard,
        icon: () => { return (<DashboardIcon />) },
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
        icon: () => { return (<ViewHeadlineIcon />) },
    },
    {
        path: '/swim-lanes-pipelines',
        sidebarName: 'Swim Lanes (Pipelines)',
        component: SwimLanesPipelines,
        icon: () => { return (<SortIcon />) },
    },
    {
        path: '/dummy',
        sidebarName: 'Dummy',
        component: DonutChart,
        icon: () => { return (<HelpIcon />) },
    },

];

ReactDOM.render(
    <AppContextProvider value={appContext}>
        <ReduxProvider store={store}>
            <MuiThemeProvider theme={materialUiTheme}>

                <BrowserRouter>

                    <div className={`app ${styles.app}`}>

                        <div className={styles.appHeader}>
                            <AppBar position="static" >
                                <Toolbar style={{minHeight: '32px'}}>
                                    <Typography variant="subtitle2" className={styles.appHeaderTitle}>
                                        Umbra-Profiler
                                    </Typography>
                                </Toolbar>
                            </AppBar>
                        </div>

                        <div className={`appNavigation ${styles.appNavigation}`}>

                            <TabPanel/>

                        </div>

                        <div className={styles.appBody}>
                            <Switch>

                                <Route exact path="/" key="/">
                                    <Redirect to="/upload" />
                                </Route>

                                <Route exact path="/upload" key="/upload">
                                    <FileUploader />
                                </Route>

                                {routes.map((route: any) => {
                                    return <Route exact path={route.path} key={route.path}>
                                        <route.component />
                                    </Route>
                                })}

                                <Route path="*">
                                    <NoMatch />
                                </Route>

                            </Switch>
                        </div>

                    </div>

                </BrowserRouter>
            </MuiThemeProvider>

        </ReduxProvider>
    </AppContextProvider>
    ,
    element,
);

function NoMatch() {
    let location = useLocation();

    return (
        <div>
            <h2>
                404: No subpage found for <code>{location.pathname}</code>.
                <br></br>
                You can upload a file to start profiling: <Link to={'/'} className="nav-link"> File Uploader </Link>
            </h2>
        </div>
    );
}

