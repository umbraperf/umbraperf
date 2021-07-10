import * as React from 'react';
import * as ReactDOM from 'react-dom';
import * as model from './model';

import { Provider as ReduxProvider } from 'react-redux';
import { Route, BrowserRouter, Switch, useLocation, Redirect, Link } from 'react-router-dom';

import './globals.css';

import Dummy from './dummy';


const store = model.createStore();

const element = document.getElementById('root');

ReactDOM.render(
    <ReduxProvider store={store}>

        <BrowserRouter>
            <div>
                <h3>Navigation:</h3>
                <nav className="navbar navbar-expand-lg navbar-light bg-light">
                    <ul className="navbar-nav mr-auto">
                        <li><Link to={'/'} className="nav-link"> Dummy </Link></li>
                        {/*                         <li><Link to={'/contact'} className="nav-link">Contact</Link></li>
                        <li><Link to={'/about'} className="nav-link">About</Link></li> */}
                    </ul>
                </nav>
                <hr />
            </div>

            <Switch>
                <Route exact path="/">
                    <Redirect to="/dummy" />
                </Route>

                <Route exact path="/dummy" component={Dummy} />

                <Route path="*">
                    <NoMatch />
                </Route>
            </Switch>

        </BrowserRouter>


    </ReduxProvider>,
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
