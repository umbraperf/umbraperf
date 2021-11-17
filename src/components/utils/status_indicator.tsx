import * as model from '../../model/';
import * as Context from '../../app_context';
import React from 'react';
import styles from "../../style/utils.module.css";
import { connect } from 'react-redux';


interface Props {
    appContext: Context.IAppContext;
}

function StatusIndicator(props: Props) {

    const getStatusString = () => {
        return "Status: " + getCurrentStatus();

    }

    const getCurrentStatus = () => {
        return ""
    }

    return (
        <div>{getStatusString()}</div>
    );
}

const mapStateToProps = (state: model.AppState) => ({
});


export default connect(mapStateToProps)(Context.withAppContext(StatusIndicator));