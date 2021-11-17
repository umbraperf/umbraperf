import * as model from '../../model/';
import * as Context from '../../app_context';
import React from 'react';
import MenuItem from '@material-ui/core/MenuItem';
import { InputLabel, Select } from '@material-ui/core';
import styles from "../../style/utils.module.css";
import { connect } from 'react-redux';

interface StatusIndicatorProps{
    visible: boolean,
}

interface AppstateProps {
    appContext: Context.IAppContext;
    currentInterpolation: String;
    setCurrentInterpolation: (newCurrentInterpolation: String) => void;
}

type Props = AppstateProps & StatusIndicatorProps;

function StatusIndicator(props: Props) {

    return (
        <div className={styles.StatusIndicatorContainer}>

        </div>
    );
}

const mapStateToProps = (state: model.AppState) => ({
    currentInterpolation: state.currentInterpolation,
});


export default connect(mapStateToProps)(Context.withAppContext(StatusIndicator));