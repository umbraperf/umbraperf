import React from 'react';
import { connect } from 'react-redux';
import * as model from '../../../model';
import * as styles from '../../../style/utils.module.css';
import BucketsizeDropdwn from './bucketsize_dropdown';
import InterpolationDropdown from './interpolation_dropdown';

interface Props {
    currentView: model.ViewType;
}

function DropdownsOptions(props: Props) {

    const isDropdownDisabled = (dropdownType: "interpolationDropdown" | "bucketsizeDropdown") => {
        if(dropdownType === "interpolationDropdown" && props.currentView === model.ViewType.DASHBOARD_MEMORY_BEHAVIOR){
            return true;
        }
        if (props.currentView === model.ViewType.DASHBOARD_UIR_PROFILING) {
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