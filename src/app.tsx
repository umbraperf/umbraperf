import { MuiThemeProvider, StylesProvider } from '@material-ui/core';
import * as React from 'react';
import { Provider as ReduxProvider } from 'react-redux';
import { Link, Redirect, Route, Router, Switch, useLocation } from 'react-router-dom';
import '../node_modules/react-grid-layout/css/styles.css';
import '../node_modules/react-resizable/css/styles.css';
import * as Config from './app_config';
import { AppContextProvider } from './app_context';
import './globals.css';
import history from "./history";
import * as styles from './style/main-app.module.css';

import HeaderAppbar from './components/utils/navigation/header_appbar';
import TabPanel from './components/utils/navigation/tab_panel';


function NoMatch() {
    let location = useLocation();

    return (
        <div>
            <h2>
                404: No subpage found for <code>{location.pathname}</code>.
                <br></br>
                You can upload a file to start profiling: <Link to={Config.appContext.topLevelComponents[0].path} className="nav-link"> File Uploader </Link>
            </h2>
        </div>
    );
}


export default function App() {
    console.log("App")
    console.log(styles)
    return (
        <AppContextProvider value={Config.appContext}>
            <ReduxProvider store={Config.store}>
                <StylesProvider injectFirst={true}>
                    <MuiThemeProvider theme={Config.materialUiTheme}>
                        <Router history={history}>
                            <div className={`app ${styles.app}`}>

                                <div className={styles.appHeader}>
                                    <HeaderAppbar />
                                </div>

                                <div className={`appNavigation ${styles.appNavigation}`}>
                                    <TabPanel />
                                </div>

                                <div className={styles.appBody}>
                                    <Switch>

                                        <Route exact path="/" key="/">
                                            <Redirect to={Config.appContext.topLevelComponents[0].path} />
                                        </Route>

                                        {Config.appContext.topLevelComponents.map((topLevelComponent) => {
                                            return <Route exact path={topLevelComponent.path} key={topLevelComponent.path}>
                                                {topLevelComponent.component}
                                            </Route>
                                        })}

                                        <Route path="*">
                                            <NoMatch />
                                        </Route>

                                    </Switch>
                                </div>

                            </div>

                        </Router>
                    </MuiThemeProvider>
                </StylesProvider>
            </ReduxProvider>
        </AppContextProvider>
    );
}
