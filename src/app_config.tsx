import * as React from 'react';
import createDevStore from './model/store_dev';
import { IAppContext } from './app_context';

import FileUploader from './components/utils/file_uploader';
import Dashboard from './components/dashboards/dashboard';
import DashboardMultipleEvents from './components/dashboards/dashboard_multiple_events';
import DashboardMemoryAccesses from './components/dashboards/dashboard_memory_accesses';
import SwimLanesPipelines from './components/charts/swim_lanes_pipelines';
import Dummy from './components/testdummy';

import HelpIcon from '@material-ui/icons/Help';
import BackupIcon from '@material-ui/icons/Backup';
import SortIcon from '@material-ui/icons/Sort';
import DashboardIcon from '@material-ui/icons/Dashboard';
import ViewStreamIcon from '@material-ui/icons/ViewStream';
import SdStorageIcon from '@material-ui/icons/SdStorage';
import { createTheme } from '@material-ui/core';
import { RequestController } from './controller/request_controller';
import { Shadows } from '@material-ui/core/styles/shadows';

export const webFileController = new RequestController();

export const appColor = {
    primary: '#f5f3bb',
    secondary: '#d4733e',
    tertiary: '#919191',
    accentBlack: '#040404',
}

export const appContext: IAppContext = {
    controller: webFileController,
    primaryColor: appColor.primary,
    secondaryColor: appColor.secondary,
    tertiaryColor: appColor.tertiary,
    accentBlack: appColor.accentBlack,
};

//Create Redux stroe
//TODO change to prod store
//export const store = createProdStore();
export const store = createDevStore();

//module augmentation to add accent color to material ui color palette
// declare module '@material-ui/core/styles/createPalette' {
//     interface Palette {
//         accent: Palette['primary'];
//     }
//     interface PaletteOptions {
//         accent: PaletteOptions['primary'];
//     }
// }
// declare module '@material-ui/core/Button/Button' {
//     interface ButtonPropsColorOverrides  {
//         accent: true;
//     }
// }
// declare module '@material-ui/core/styles/createTheme' {
//     interface Theme {
//         accentColor: {
//             accent: React.CSSProperties['color'],
//         }
//     }
//     interface ThemeOptions {
//         accentColor: {
//             accent: React.CSSProperties['color']
//         }
//     }
// }

export const materialUiTheme = createTheme({
    shadows: Array(25).fill("none") as Shadows,
    palette: {
        primary: {
            main: appColor.primary
        },
        secondary: {
            main: appColor.secondary
        },
        // accent: {
        //     main: appColor.secondary,
        // },
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

console.log(materialUiTheme);

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