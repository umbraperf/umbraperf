import React from 'react';
import * as model from '../../model';
import styles from '../../style/dashboard.module.css';
import DashboardHeader from './dashboard_header';
import { connect } from 'react-redux';

import DashboardSingleEvent from '../dashboards/dashboard_single_event';
import DashboardMultipleEvents from '../dashboards/dashboard_multiple_events';
import DashboardMemoryAccesses from '../dashboards/dashboard_memory_accesses';
import DashboardUir from '../dashboards/dashboard_uir';
import { Redirect } from 'react-router-dom';

interface OwnProps {
    dashboardView: model.ViewType;
}

interface DashboardWrapperAppstateProps {
    umbraperfFileParsingFinished: boolean;
    setCurrentView: (newCurrentView: model.ViewType) => void;
}

type Props = OwnProps & DashboardWrapperAppstateProps;

class DashboardWrapper extends React.Component<Props, {}> {

    constructor(props: Props) {
        super(props);
        this.props.setCurrentView(model.ViewType.NONE);
    }


    componentDidMount() {
        this.props.setCurrentView(this.props.dashboardView);
    }

    createView() {

        switch (this.props.dashboardView) {
            case model.ViewType.DASHBOARD_SINGLE_EVENT:
                return React.createElement(DashboardSingleEvent);
            case model.ViewType.DASHBOARD_MULTIPLE_EVENTS:
                return React.createElement(DashboardMultipleEvents);
            case model.ViewType.DASHBOARD_MEMORY:
                return React.createElement(DashboardMemoryAccesses);
            case model.ViewType.DASHBOARD_UIR:
                return React.createElement(DashboardUir);
        }

    }

    public render() {

        if (!this.props.umbraperfFileParsingFinished) {
            return <Redirect to={"/upload"} />
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

const mapDispatchToProps = (dispatch: model.Dispatch) => ({
    setCurrentView: (newCurrentView: model.ViewType) =>
        dispatch({
            type: model.StateMutationType.SET_CURRENT_VIEW,
            data: newCurrentView,
        })
});

export default connect(mapStateToProps, mapDispatchToProps)(DashboardWrapper);



