import * as React from 'react';
import { IAppContext } from './app_context';
import * as model from './model';
import createDevStore from './model/store_dev';

import DashboardWrapper from './components/dashboards/dashboard_wrapper';
import FileUploader from './components/utils/containers/file_uploader';

import { createTheme } from '@material-ui/core';
import { Shadows } from '@material-ui/core/styles/shadows';
import BackupIcon from '@material-ui/icons/Backup';
import CodeIcon from '@material-ui/icons/Code';
import DashboardIcon from '@material-ui/icons/Dashboard';
import SaveIcon from '@material-ui/icons/Save';
import ViewStreamIcon from '@material-ui/icons/ViewStream';
import { RequestController } from './controller/request_controller';

export const backendRequestController = new RequestController();

//Create Redux stroe
//TODO change to prod store
//export const store = createProdStore();
export const store = createDevStore();

export const appColor = {
    primary: '#f5f3bb',
    secondary: '#d4733e',
    tertiary: '#919191',
    accentBlack: '#040404',
    accentDarkGreen: '#379634',
    accentDarkBlue: '#454E9E',
}

export const materialUiTheme = createTheme({
    shadows: Array(25).fill("none") as Shadows,
    palette: {
        primary: {
            main: appColor.primary
        },
        secondary: {
            main: appColor.secondary
        },
    },
    breakpoints: {
        values: {
            xs: 0,
            sm: 600,
            md: 900,
            lg: 1200,
            xl: 1535, //customized from 1536
        },
    }
});

export interface ITopLevelComponent {
    viewType: model.ViewType;
    path: string;
    name: string;
    component: JSX.Element;
    icon: () => JSX.Element;
}

const topLevelComponents: Array<ITopLevelComponent> = [
    {
        viewType: model.ViewType.UPLOAD,
        path: '/file-upload',
        name: 'Upload File',
        component: <FileUploader />,
        icon: () => { return (<BackupIcon />) },
    },
    {
        viewType: model.ViewType.DASHBOARD_SINGLE_EVENT,
        path: '/single-event-dashboard',
        name: 'Single Event Dashboard',
        component: <DashboardWrapper dashboardView={model.ViewType.DASHBOARD_SINGLE_EVENT} />,
        icon: () => { return (<DashboardIcon />) },
    },
    {
        viewType: model.ViewType.DASHBOARD_MULTIPLE_EVENTS,
        path: '/multiple-events-dashboard',
        name: 'Multiple Events Dashboard',
        component: <DashboardWrapper dashboardView={model.ViewType.DASHBOARD_MULTIPLE_EVENTS} />,
        icon: () => { return (<ViewStreamIcon />) },
    },
    {
        viewType: model.ViewType.DASHBOARD_MEMORY_BEHAVIOR,
        path: '/memory-behavior-dashboard',
        name: 'Memory Behavior Dashboard',
        component: <DashboardWrapper dashboardView={model.ViewType.DASHBOARD_MEMORY_BEHAVIOR} />,
        icon: () => { return (<SaveIcon />) },
    },
    {
        viewType: model.ViewType.DASHBOARD_UIR_PROFILING,
        path: '/uir-profiling-dashboard',
        name: 'UIR Profiling Dashboard',
        component: <DashboardWrapper dashboardView={model.ViewType.DASHBOARD_UIR_PROFILING} />,
        icon: () => { return (<CodeIcon />) },
    },

];

export const appContext: IAppContext = {
    controller: backendRequestController,
    primaryColor: appColor.primary,
    secondaryColor: appColor.secondary,
    tertiaryColor: appColor.tertiary,
    accentBlack: appColor.accentBlack,
    accentDarkGreen: appColor.accentDarkGreen,
    accentDarkBlue: appColor.accentDarkBlue,
    topLevelComponents: topLevelComponents,
};