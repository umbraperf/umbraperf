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

import VisualizationContainer from './components/visualization_container';
import TabPanel from './components/utils/tab_panel';
import FileUploader from './components/utils/file_uploader';
import Dashboard from './components/dashboards/dashboard';
import DashboardMultipleEvents from './components/dashboards/dashboard_multiple_events';
import DashboardMemoryAccesses from './components/dashboards/dashboard_memory_accesses';
import Dummy from './components/testdummy';
import SwimLanesPipelines from './components/charts/swim_lanes_pipelines';

import HelpIcon from '@material-ui/icons/Help';
import BackupIcon from '@material-ui/icons/Backup';
import SortIcon from '@material-ui/icons/Sort';
import DashboardIcon from '@material-ui/icons/Dashboard';
import ViewStreamIcon from '@material-ui/icons/ViewStream';
import SdStorageIcon from '@material-ui/icons/SdStorage';
import { StylesProvider, AppBar, createTheme, MuiThemeProvider, Toolbar, Typography } from '@material-ui/core';
import { RequestController } from './controller/request_controller';
import { Shadows } from '@material-ui/core/styles/shadows';


const webFileController = new RequestController();

const appColor = {
    primary: '#040404',
    secondary: '#d4733e',
    tertiary: '#919191',
}

export const appContext: IAppContext = {
    controller: webFileController,
    primaryColor: appColor.primary,
    secondaryColor: appColor.secondary,
    tertiaryColor: appColor.tertiary,
};

//Create Redux stroe
//TODO change to prod store
//export const store = createProdStore();
export const store = createDevStore();

const materialUiTheme = createTheme({
    shadows: Array(25).fill("none") as Shadows,
    palette: {
        primary: {
            main: appColor.primary
        },
        secondary: {
            main: appColor.secondary
        }
    },
    breakpoints: {
        values: {
            xs: 0,
            sm: 600,
            md: 900,
            lg: 1200,
            xl: 1535, //customized from 1536
        },
    },
})

export const topLevelComponents = [
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
        path: '/dashboard-multiple-events',
        sidebarName: 'Dashboard (Multiple Events)',
        component: DashboardMultipleEvents,
        icon: () => { return (<ViewStreamIcon />) },
    },
    {
        path: '/dashboard-memory-accesses',
        sidebarName: 'Dashboard (Memory Accesses)',
        component: DashboardMemoryAccesses,
        icon: () => { return (<SdStorageIcon />) },
    },
    // {
    //     path: '/bar-chart',
    //     sidebarName: 'Bar Chart',
    //     component: BarChart,
    //     icon: () => { return (<BarChartIcon />) },
    // },
    // {
    //     path: '/swim-lanes',
    //     sidebarName: 'Swim Lanes',
    //     component: SwimLanes,
    //     icon: () => { return (<ViewHeadlineIcon />) },
    // },
    {
        path: '/swim-lanes-pipelines',
        sidebarName: 'Swim Lanes (Pipelines)',
        component: SwimLanesPipelines,
        icon: () => { return (<SortIcon />) },
    },
    // {
    //     path: '/swim-lanes-multiple-pipelines',
    //     sidebarName: 'Swim Lanes (Multiple Pipelines)',
    //     component: SwimLanesMultiplePipelines,
    //     icon: () => { return (<MultilineChartIcon />) },
    // },
    // {
    //     path: '/swim-lanes-multiple-pipelines-combined',
    //     sidebarName: 'Swim Lanes (Multiple Events)',
    //     component: SwimLanesCombinedMultiplePipelines,
    //     icon: () => { return (<ViewStreamIcon />) },
    // },
    // {
    //     path: '/donut-chart',
    //     sidebarName: 'Donut Chart',
    //     component: DonutChart,
    //     icon: () => { return (<DonutLargeIcon />) },
    // },
    {
        path: '/dummy',
        sidebarName: 'Dummy',
        component: Dummy,
        icon: () => { return (<HelpIcon />) },
    },

];

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


export default function App() {
    return (
        <AppContextProvider value={appContext}>
            <ReduxProvider store={store}>
                <StylesProvider injectFirst={true}>
                    <MuiThemeProvider theme={materialUiTheme}>
                        <BrowserRouter>

                            <div className={`app ${styles.app}`}>

                                <div className={styles.appHeader}>
                                    <AppBar position="static" >
                                        <Toolbar style={{ minHeight: '38px' }}>
                                            <Typography variant="h6" className={styles.appHeaderTitle}>
                                                Umbra-Profiler
                                            </Typography>
                                        </Toolbar>
                                    </AppBar>
                                </div>

                                <div className={`appNavigation ${styles.appNavigation}`}>

                                    <TabPanel />

                                </div>

                                <div className={styles.appBody}>
                                    <Switch>

                                        <Route exact path="/" key="/">
                                            <Redirect to="/upload" />
                                        </Route>

                                        <Route exact path="/upload" key="/upload">
                                            <FileUploader />
                                        </Route>

                                        <Route exact path="/dashboard" key="/dashboard">
                                            <Dashboard />
                                        </Route>

                                        <Route exact path="/dashboard-multiple-events" key="/dashboard-multiple-events">
                                            <DashboardMultipleEvents />
                                        </Route>

                                        <Route exact path="/dashboard-memory-accesses" key="/dashboard-memory-accesses">
                                            <DashboardMemoryAccesses />
                                        </Route>

                                        <Route exact path="/dummy" key="/dummy">
                                            <Dummy />
                                        </Route>

                                        {topLevelComponents.map((route: any) => {
                                            return <Route exact path={route.path} key={route.path}>
                                                <VisualizationContainer component={route.component} visualizationName={route.path} />
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
                </StylesProvider>
            </ReduxProvider>
        </AppContextProvider>
    );
}


