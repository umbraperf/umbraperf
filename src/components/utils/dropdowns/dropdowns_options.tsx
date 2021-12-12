import * as model from '../../../model';
import React from 'react';
import styles from '../../../style/utils.module.css';
import InterpolationDropdown from './interpolation_dropdown';
import BucketsizeDropdwn from './bucketsize_dropdown';
import { connect } from 'react-redux';

interface Props {
    currentView: model.ViewType;
}

function DropdownsOptions(props: Props) {

    const isDropdownDisabled = (dropdownType: "interpolationDropdown" | "bucketsizeDropdown") => {
        if(dropdownType === "interpolationDropdown" && props.currentView === model.ViewType.DASHBOARD_MEMORY){
            return true;
        }
        if (props.currentView === model.ViewType.DASHBOARD_UIR) {
            return true;
        }
        return false;
    }

    return <div className={styles.dropdownOptionsContainer}>
        <InterpolationDropdown disabled={isDropdownDisabled("interpolationDropdown")} />
        <BucketsizeDropdwn disabled={isDropdownDisabled("bucketsizeDropdown")} />
    </div>

}

const mapStateToProps = (state: model.AppState) => ({
    currentView: state.currentView,
});

export default connect(mapStateToProps)(DropdownsOptions);