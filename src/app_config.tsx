import * as React from 'react';
import createDevStore from './model/store_dev';
import { IAppContext } from './app_context';
import styles from './style/export-variables.module.css';
import * as model from './model';

import FileUploader from './components/utils/containers/file_uploader';
import DashboardWrapper from './components/dashboards/dashboard_wrapper';

import BackupIcon from '@material-ui/icons/Backup';
import DashboardIcon from '@material-ui/icons/Dashboard';
import ViewStreamIcon from '@material-ui/icons/ViewStream';
import SdStorageIcon from '@material-ui/icons/SdStorage';
import DeveloperModeIcon from '@material-ui/icons/DeveloperMode';
import { createTheme } from '@material-ui/core';
import { RequestController } from './controller/request_controller';
import { Shadows } from '@material-ui/core/styles/shadows';

export const webFileController = new RequestController();

export const appColor = {
    primary: styles.colorPrimary,
    secondary: styles.colorSecondary,
    tertiary: styles.colorTertiary,
    accentBlack: styles.colorAccentBlack,
    accentDarkGreen: styles.colorAccentDarkGreen,
    accentDarkBlue: styles.colorAccentDarkBlue,
}

export const appContext: IAppContext = {
    controller: webFileController,
    primaryColor: appColor.primary,
    secondaryColor: appColor.secondary,
    tertiaryColor: appColor.tertiary,
    accentBlack: appColor.accentBlack,
    accentDarkGreen: appColor.accentDarkGreen,
    accentDarkBlue: appColor.accentDarkBlue,
};

//Create Redux stroe
//TODO change to prod store
//export const store = createProdStore();
export const store = createDevStore();


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

interface ITopLevelComponent {
    viewType: model.ViewType;
    path: string;
    sidebarName: string;
    component: JSX.Element;
    icon: () => JSX.Element;
}
export const topLevelComponents: Array<ITopLevelComponent> = [
    {
        viewType: model.ViewType.UPLOAD,
        path: '/upload',
        sidebarName: 'Upload File',
        component: <FileUploader />,
        icon: () => { return (<BackupIcon />) },
    },
    {
        viewType: model.ViewType.DASHBOARD_SINGLE_EVENT,
        path: '/dashboard-single-event',
        sidebarName: 'Dashboard (Single Event)',
        component: <DashboardWrapper dashboardView={model.ViewType.DASHBOARD_SINGLE_EVENT} />,
        icon: () => { return (<DashboardIcon />) },
    },
    {
        viewType: model.ViewType.DASHBOARD_MULTIPLE_EVENTS,
        path: '/dashboard-multiple-events',
        sidebarName: 'Dashboard (Multiple Events)',
        component: <DashboardWrapper dashboardView={model.ViewType.DASHBOARD_MULTIPLE_EVENTS} />,
        icon: () => { return (<ViewStreamIcon />) },
    },
    {
        viewType: model.ViewType.DASHBOARD_MEMORY,
        path: '/dashboard-memory-accesses',
        sidebarName: 'Dashboard (Memory Accesses)',
        component: <DashboardWrapper dashboardView={model.ViewType.DASHBOARD_MEMORY} />,
        icon: () => { return (<SdStorageIcon />) },
    },
    {
        viewType: model.ViewType.DASHBOARD_UIR,
        path: '/dashboard-uir',
        sidebarName: 'Dashboard (UIR)',
        component: <DashboardWrapper dashboardView={model.ViewType.DASHBOARD_UIR} />,
        icon: () => { return (<DeveloperModeIcon />) },
    },
    // {
    //     path: '/swim-lanes-pipelines',
    //     sidebarName: 'Swim Lanes (Pipelines)',
    //     // component: SwimLanesPipelines,
    //     // view: model.ViewType.PIPELINES,
    //     icon: () => { return (<SortIcon />) },
    // },
    // {
    //     path: '/dummy',
    //     sidebarName: 'Dummy',
    //     component: Dummy,
    //     view: model.ViewType.DUMMY,
    //     icon: () => { return (<HelpIcon />) },
    // },

];