import React from 'react';
import * as model from '../../model';
import styles from '../../style/dashboard.module.css';
import DashboardHeader from './dashboard_header';
import { connect } from 'react-redux';

import DashboardSingleEvent from '../dashboards/dashboard_single_event';
import DashboardMultipleEvents from '../dashboards/dashboard_multiple_events';
import DashboardMemoryAccesses from '../dashboards/dashboard_memory_accesses';
import DashboardUir from '../dashboards/dashboard_uir';

interface OwnProps {
    dashboardView: model.ViewType;
}

interface DashboardWrapperAppstateProps {
    events: Array<string> | undefined;
    currentEvent: "Default",
    setCurrentView: (newCurrentView: model.ViewType) => void;
    setCurrentEvent: (newCurrentEvent: string) => void;

}

type Props = OwnProps & DashboardWrapperAppstateProps;

class DashboardWrapper extends React.Component<Props, {}> {

    constructor(props: any) {
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
                //switch current event to memory loads if available
                if (this.props.events?.includes("mem_inst_retired.all_loads")) {
                    this.props.setCurrentEvent("mem_inst_retired.all_loads");
                }
                return React.createElement(DashboardMemoryAccesses);
            case model.ViewType.DASHBOARD_UIR:
                return React.createElement(DashboardUir);
        }

    }

    public render() {

        return <div className={styles.dashboardGrid}>
            <DashboardHeader />

            {this.createView()}
        </div >;
    }
}

const mapStateToProps = (state: model.AppState) => ({
    events: state.events,
    currentEvent: state.currentEvent,
});

const mapDispatchToProps = (dispatch: model.Dispatch) => ({
    setCurrentView: (newCurrentView: model.ViewType) =>
        dispatch({
            type: model.StateMutationType.SET_CURRENTVIEW,
            data: newCurrentView,
        }),
    setCurrentEvent: (newCurrentEvent: string) =>
        dispatch({
            type: model.StateMutationType.SET_CURRENTEVENT,
            data: newCurrentEvent,
        }),
});

export default connect(mapStateToProps, mapDispatchToProps)(DashboardWrapper);



