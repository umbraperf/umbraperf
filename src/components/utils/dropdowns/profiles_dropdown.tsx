import * as model from '../../../model';
import * as Context from '../../../app_context';
import React from 'react';
import MenuItem from '@material-ui/core/MenuItem';
import { Button, ListItemIcon, ListItemText, Menu, MenuProps, Typography, withStyles } from '@material-ui/core';
import KeyboardArrowDownIcon from '@material-ui/icons/KeyboardArrowDown';
import styles from "../../../style/utils.module.css";
import { connect } from 'react-redux';


interface AppstateProps {
    appContext: Context.IAppContext;
    // currentInterpolation: String;
    //setCurrentInterpolation: (newCurrentInterpolation: String) => void;
}

type Props = AppstateProps;


function ProfilesDropdown(props: Props) {

    const StyledMenu = withStyles({
        paper: {
            border: '1px solid #d3d4d5',
        },
    })((props: MenuProps) => (
        <Menu
            elevation={0}
            getContentAnchorEl={null}
            anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'center',
            }}
            transformOrigin={{
                vertical: 'top',
                horizontal: 'center',
            }}
            {...props}
        />
    ));

    const StyledMenuItem = withStyles((theme) => ({
        root: {
            '&:focus': {
                backgroundColor: props.appContext.secondaryColor,
                '& .MuiListItemIcon-root, & .MuiListItemText-primary': {
                    color: theme.palette.common.white,
                },
            },
        },
    }))(MenuItem);

    const profiles = [
        //get from redux store -> object with icon and text
        "Standard (Overview)", "Memory Behaviour", "Detailed Analysis", "UIR Analysis", "Cache Behaviour"
    ];

    const menuProfiles = profiles.map((elem, index) => (
        <>
            <ListItemIcon>
                <KeyboardArrowDownIcon className={styles.profilesMenuItemContentIcon} fontSize="small" />
            </ListItemIcon>
            <ListItemText>
                <Typography
                    className={styles.profilesMenuItemContentText}
                    variant="body2">
                    {elem}
                </Typography>
            </ListItemText>

        </>
    ));

    const handleOnItemClick = (elem: string) => {
        // props.setCurrentInterpolation(elem);
        handleClose();
    };

    const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
    const [isOpen, setIsOpen] = React.useState<boolean>(false);

    const handleClick = (event: React.MouseEvent<HTMLElement>) => {
        setIsOpen(true);
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setIsOpen(false);
        setAnchorEl(null);
    };

    return (

        <div className={styles.profilesMenuContainer}>
            <Button
                className={styles.profilesMenuButton}
                aria-controls="profileMenu"
                aria-haspopup="true"
                onClick={handleClick}
                onMouseOver={handleClick}
                size="small"
                endIcon={<KeyboardArrowDownIcon />}
            >
                Change profile
            </Button>
            <StyledMenu
                classes={{ paper: styles.profilesMenuPaper }}
                id="profileMenu"
                anchorEl={anchorEl}
                getContentAnchorEl={null}
                keepMounted
                open={isOpen}
                onClose={handleClose}
                onMouseLeave={handleClose}
            >
                {menuProfiles.map((elem, index) =>
                (<StyledMenuItem
                    className={styles.profilesMenuItem}
                    onClick={() => handleOnItemClick(profiles[index])}
                    key={index}
                >
                    {elem}
                </StyledMenuItem>)
                )}
            </StyledMenu>
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