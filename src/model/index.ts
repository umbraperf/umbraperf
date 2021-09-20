/* eslint-disable @typescript-eslint/no-require-imports */
/* eslint-disable @typescript-eslint/no-var-requires */
import { AppState } from './state';
import { Store } from 'redux';
import { StateMutationVariant } from './state_mutation';
import * as model from '../model';


export * from './state_mutation';
export * from './state';
export * from './chart_data_result';
export * from './core_result';
export * from './rest_queries';

// XXX Conditional
import storeDev from './store_dev';
import storeProd from './store_prod';
export let createStore: () => model.AppReduxStore;
if (process.env.NODE_ENV === 'production') {
    createStore = storeDev;
} else {
    createStore = storeProd;
}

// The store type
export type AppReduxStore = Store<AppState, StateMutationVariant>;