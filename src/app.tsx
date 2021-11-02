import * as React from 'react';
import { AppContextProvider } from './app_context';
import { Provider as ReduxProvider } from 'react-redux';
import { Route, BrowserRouter, Switch, useLocation, Redirect, Link } from 'react-router-dom';
import { StylesProvider, AppBar, MuiThemeProvider, Toolbar, Typography } from '@material-ui/core';

import './globals.css';
import '../node_modules/react-grid-layout/css/styles.css';
import '../node_modules/react-resizable/css/styles.css';
import styles from './style/main-app.module.css';
import * as Config from './app_config';

import VisualizationContainer from './components/visualization_container';
import TabPanel from './components/utils/tab_panel';
import FileUploader from './components/utils/file_uploader';
import Dashboard from './components/dashboards/dashboard';
import DashboardMultipleEvents from './components/dashboards/dashboard_multiple_events';
import DashboardMemoryAccesses from './components/dashboards/dashboard_memory_accesses';
import Dummy from './components/testdummy';


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
        <AppContextProvider value={Config.appContext}>
            <ReduxProvider store={Config.store}>
                <StylesProvider injectFirst={true}>
                    <MuiThemeProvider theme={Config.materialUiTheme}>
                        {console.log(Config.materialUiTheme)}
                        <BrowserRouter>

                            <div className={`app ${styles.app}`}>

                                <div className={styles.appHeader}>
                                    <AppBar position="static" style={{ color: "white", background: Config.appContext.accentBlack }} >
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

                                        {Config.topLevelComponents.map((route: any) => {
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


