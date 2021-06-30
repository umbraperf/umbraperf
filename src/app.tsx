import * as React from 'react';
import * as ReactDOM from 'react-dom';
import * as model from './model';
import Dummy from './dummy';
import { Provider as ReduxProvider } from 'react-redux';
import { Route, BrowserRouter } from 'react-router-dom';

import './globals.css';

const store = model.createStore();

const element = document.getElementById('root');

ReactDOM.render(
    <ReduxProvider store={store}>
        <BrowserRouter>
            <Route component={Dummy} />
        </BrowserRouter>
    </ReduxProvider>,
    element,
);
