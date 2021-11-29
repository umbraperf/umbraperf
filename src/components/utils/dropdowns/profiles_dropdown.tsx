import * as model from '../../../model';
import * as Context from '../../../app_context';
import React from 'react';
import MenuItem from '@material-ui/core/MenuItem';
import { FormControl, InputLabel, makeStyles, Select } from '@material-ui/core';
import styles from "../../../style/utils.module.css";
import { connect } from 'react-redux';


interface AppstateProps {
    appContext: Context.IAppContext;
    // currentInterpolation: String;
    //setCurrentInterpolation: (newCurrentInterpolation: String) => void;
}

type Props = AppstateProps;

const useMenuPropsStyles = makeStyles({
    select: {
        "& ul": {
            backgroundColor: "#cccccc",
        },
        "& li": {
            fontSize: 1,
        },
    }
});

const useStyles = makeStyles({
    select: {
        '&:before': {
            borderColor: 'white',
        },
        '&:after': {
            borderColor: 'white',
        },
        '&:not(.Mui-disabled):hover::before': {
            borderColor: 'white',
        },
    },
    icon: {
        fill: 'white',
    },
    root: {
        color: 'white',
    },
});

function ProfilesDropdown(props: Props) {

    const profiles = [
        "Standard (Overview)", "Memory Behaviour", "Detailed Analysis", "UIR Analysis", "Cache Behaviour"
    ];

    const handleOnItemClick = (elem: string) => {
        // props.setCurrentInterpolation(elem);
    };


    const classes = useStyles();
    const menuClasses = useMenuPropsStyles();

    return (

        <div className={styles.profilesDropdownSelectorContainer}>

            test
            {/* <div className={styles.profilesDropdownSelectorContainer}>
            <FormControl
                className={styles.profilesDropdownSelectorControl}
                fullWidth
                size='small'
                variant='outlined'>
                <InputLabel id="profiles-selector-label" className={styles.profilesDropdownSelectorLabel} style={{ color: props.appContext.tertiaryColor }} >Interpolation: </InputLabel>
                <Select
                    inputProps={{
                        classes: {
                            icon: classes.icon,
                            root: classes.root,
                        },
                    }}
                    MenuProps={{
                        classes: {
                            paper: menuClasses.select
                        }
                    }}
                    className={classes.select}
                    // className={styles.profilesDropdownSelector}
                    color="secondary"
                    labelId="profiles-selector-label"
                    id="profiles-selector"
/*                     value={profiles[1]}
                    disabled={false /* disable while csv loading }
                >
                    {profiles.map((elem, index) =>
                        (<MenuItem onClick={() => handleOnItemClick(elem)} key={index} value={elem}>{elem}</MenuItem>)
                    )}
                </Select>
            </FormControl >
        </div> */
            }
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