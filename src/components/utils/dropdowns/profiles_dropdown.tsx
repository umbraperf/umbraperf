import * as model from '../../../model';
import * as Context from '../../../app_context';
import React from 'react';
import MenuItem from '@material-ui/core/MenuItem';
import { FormControl, InputLabel, Select } from '@material-ui/core';
import styles from "../../../style/utils.module.css";
import { connect } from 'react-redux';


interface AppstateProps {
    appContext: Context.IAppContext;
    // currentInterpolation: String;
    //setCurrentInterpolation: (newCurrentInterpolation: String) => void;
}

type Props = AppstateProps;

function ProfilesDropdown(props: Props) {

    const profiles = [
        "Standard (Overview)", "Memory Behaviour", "Detailed Analysis", "UIR Analysis", "Cache Behaviour"
    ];

    const handleOnItemClick = (elem: string) => {
        // props.setCurrentInterpolation(elem);
    };


    return (
        <div className={styles.profilesDropdownSelectorContainer}>
            <FormControl fullWidth>
                <InputLabel className={styles.profilesDropdownSelectorLabel} style={{ color: props.appContext.tertiaryColor }} id="interpolation-selector-label">Interpolation: </InputLabel>
                <Select className={styles.profilesDropdownSelector}
                    color="secondary"
                    labelId="interpolation-selector-label"
                    id="interpolation-selector"
                    value={profiles[1]}
                    disabled={false /* disable while csv loading */}
                >
                    {profiles.map((elem, index) =>
                        (<MenuItem onClick={() => handleOnItemClick(elem)} key={index} value={elem}>{elem}</MenuItem>)
                    )}
                </Select>
            </FormControl >
        </div>
    );
}

const mapStateToProps = (state: model.AppState) => ({
    // currentInterpolation: state.currentInterpolation,
});

const mapDispatchToProps = (dispatch: model.Dispatch) => ({
    // setCurrentInterpolation: (newCurrentInterpolation: String) => dispatch({
    //     type: model.StateMutationType.SET_CURRENTINTERPOLATION,
    //     data: newCurrentInterpolation,
    // }),
});

export default connect(mapStateToProps, mapDispatchToProps)(Context.withAppContext(ProfilesDropdown));