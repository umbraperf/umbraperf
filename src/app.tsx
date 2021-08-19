import * as React from 'react';
import * as ReactDOM from 'react-dom';
import createProdStore from './model/store_prod';
import { IAppContext, AppContextProvider } from './app_context';

import { Provider as ReduxProvider } from 'react-redux';
import { Route, BrowserRouter, Switch, useLocation, Redirect, Link } from 'react-router-dom';

import './globals.css';
import styles from './style/main-app.module.css';

import Dummy from './components/dummy';
import Parquet from './components/parquet';
import PersistentDrawerLeft from './components/drawer';
import { WorkerAPI } from './worker_api';
import { BottomNavigation, BottomNavigationAction } from '@material-ui/core';


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
        component: Dummy
    },
    {
        path: '/dummy',
        sidebarName: 'Dummy',
        component: Dummy
    },
    {
        path: '/parquet',
        sidebarName: 'Parquet',
        component: Parquet
    }

];

ReactDOM.render(
    <AppContextProvider value={appContext}>
        <ReduxProvider store={store}>
            <BrowserRouter>

                {/*                 style: css module with additional static class (cloud also be a seccond module)
 */}                <div className={`app ${styles.app}`}>

                    <PersistentDrawerLeft></PersistentDrawerLeft>

                    <div className="appBody">
                        <Switch>

                            <Route exact path="/">
                                <Redirect to="/parquet" />
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

                        <BottomNavigation
                            showLabels
                        >
                            <BottomNavigationAction label="Recents" />
                            <BottomNavigationAction label="Favorites" />
                            <BottomNavigationAction label="Nearby" />
                        </BottomNavigation>

                        <h3>Navigation:</h3>
                        <nav className="navbar navbar-expand-lg navbar-light bg-light">
                            <ul className="navbar-nav mr-auto">
                                <li><Link to={'/parquet'} className="nav-link"> Parquet </Link></li>
                                <li><Link to={'/dummy'} className="nav-link"> Dummy </Link></li>
                            </ul>
                        </nav>
                        <hr />
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
