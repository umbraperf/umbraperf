import * as model from '../../model';
import * as Controller from '../../controller';
import * as Context from '../../app_context';
import styles from '../../style/dashboard.module.css';
import DashboardHeader from './dashboard_header';
import React from 'react';
import { connect } from 'react-redux';
import { Redirect } from 'react-router-dom';

import DashboardSingleEvent from '../dashboards/dashboard_single_event';
import DashboardMultipleEvents from '../dashboards/dashboard_multiple_events';
import DashboardMemoryAccesses from '../dashboards/dashboard_memory_accesses';
import DashboardUir from '../dashboards/dashboard_uir';

interface OwnProps {
    dashboardView: model.ViewType;
}

interface DashboardWrapperAppstateProps {
    appContext: Context.IAppContext;
    umbraperfFileParsingFinished: boolean;
}

type Props = OwnProps & DashboardWrapperAppstateProps;

class DashboardWrapper extends React.Component<Props, {}> {

    constructor(props: Props) {
        super(props);
        Controller.setCurrentView(model.ViewType.NONE);
    }


    componentDidMount() {
        Controller.setCurrentView(this.props.dashboardView);
    }

    createView() {

        switch (this.props.dashboardView) {
            case model.ViewType.DASHBOARD_SINGLE_EVENT:
                return React.createElement(DashboardSingleEvent);
            case model.ViewType.DASHBOARD_MULTIPLE_EVENTS:
                return React.createElement(DashboardMultipleEvents);
            case model.ViewType.DASHBOARD_MEMORY_BEHAVIOR:
                return React.createElement(DashboardMemoryAccesses);
            case model.ViewType.DASHBOARD_UIR_PROFILING:
                return React.createElement(DashboardUir);
        }

    }

    public render() {

        if (!this.props.umbraperfFileParsingFinished) {
            return <Redirect to={this.props.appContext.topLevelComponents[0].path} />
        }

        return <div className={styles.dashboardGrid}>
            <DashboardHeader />

            {this.createView()}
        </div >;
    }
}

const mapStateToProps = (state: model.AppState) => ({
    umbraperfFileParsingFinished: state.umbraperfFileParsingFinished,
});


export default connect(mapStateToProps)(Context.withAppContext(DashboardWrapper));



