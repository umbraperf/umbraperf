import * as model from '../model';
import React from "react";
import { connect } from 'react-redux';
import {withAppContext } from '../app_context';
import styles from '../style/dashboard.module.css';


interface Props {

}

interface State {

}


class Dashboard extends React.Component<Props, State> {

    constructor(props: Props) {
        super(props);
        this.state = {

        };
    }

    componentDidMount(): void {
    }

    componentDidUpdate(prevProps: Props): void {

    }

    public render() {
        return <div></div>
    }

}

const mapStateToProps = (state: model.AppState) => ({

});

const mapDispatchToProps = (dispatch: model.Dispatch) => ({

});

export default connect(mapStateToProps, mapDispatchToProps)(withAppContext(Dashboard));

