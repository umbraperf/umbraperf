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
import Parquet from './components/parquet';
import TabPanel from './components/tab_panel';
import { WorkerAPI } from './worker_api';

import HelpIcon from '@material-ui/icons/Help';
import BackupIcon from '@material-ui/icons/Backup';
import { AppBar, Toolbar, Typography } from '@material-ui/core';


//Create Redux stroe
const store = createProdStore();

//Create WorkerAPI
const workerAPI = new WorkerAPI();

const appContext: IAppContext = {
    worker: workerAPI,
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
        path: '/dummy',
        sidebarName: 'Dummy',
        component: Dummy,
        icon: () => { return (<HelpIcon />) },
    },
    {
        path: '/parquet',
        sidebarName: 'Parquet',
        component: Parquet,
        icon: () => { return (<HelpIcon />) },
    },
    {
        path: '/upload',
        sidebarName: 'Upload File',
        component: FileUploader,
        icon: () => { return (<BackupIcon />) },
    }

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
