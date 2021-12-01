import * as model from '../../../model';
import * as Controller from '../../../controller';
import * as Context from '../../../app_context';
import React from 'react';
import MenuItem from '@material-ui/core/MenuItem';
import { Button, ListItemIcon, ListItemText, Menu, MenuProps, Tooltip, Typography, withStyles } from '@material-ui/core';
import KeyboardArrowDownIcon from '@material-ui/icons/KeyboardArrowDown';
import InfoIcon from '@material-ui/icons/Info';
import styles from "../../../style/utils.module.css";
import { connect } from 'react-redux';


interface Props {
    appContext: Context.IAppContext;
    currentProfile: model.ProfileType;
    profiles: Array<model.ProfileVariant>;
    events: Array<string> | undefined;
    currentView: model.ViewType;
}

function ProfilesMenu(props: Props) {

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

    const menuProfiles = props.profiles.map((elem, index) => (
        <>
            <ListItemIcon>
                {React.createElement(elem.icon, { className: styles.profilesMenuItemContentIcon, fontSize: "small" })}
                {/* <KeyboardArrowDownIcon className={styles.profilesMenuItemContentIcon} fontSize="small" /> */}
            </ListItemIcon>
            <ListItemText>
                <Typography
                    className={styles.profilesMenuItemContentText}
                    variant="body2">
                    {elem.readableName}
                </Typography>
            </ListItemText>
            <ListItemIcon>
                <Tooltip title={elem.description}>
                    <InfoIcon className={styles.profilesMenuItemContentIconInfo} />
                </Tooltip>
            </ListItemIcon>

        </>
    ));

    const handleOnItemClick = (index: number) => {
        Controller.changeProfile(props.profiles[index].type);
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

    const isMenuDisabled =  undefined === props.events || model.ViewType.UPLOAD === props.currentView;  

    return (

        <div className={styles.profilesMenuContainer}>
            <Button
                className={styles.profilesMenuButton}
                classes={{ disabled: styles.profilesMenuButtonDisabled }}
                aria-controls="profileMenu"
                aria-haspopup="true"
                onClick={handleClick}
                size="small"
                endIcon={<KeyboardArrowDownIcon />}
                disabled={isMenuDisabled}
            >
                {props.currentProfile}
            </Button>

            <Menu
                classes={{ paper: styles.profilesMenuPaper }}
                id="profileMenu"
                anchorEl={anchorEl}
                getContentAnchorEl={null}
                keepMounted
                open={isOpen}
                onClose={handleClose}
                onMouseLeave={handleClose}
                elevation={0}
                anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'center',
                }}
                transformOrigin={{
                    vertical: 'top',
                    horizontal: 'center',
                }}
            >
                {menuProfiles.map((elem, index) =>
                (<StyledMenuItem
                    className={styles.profilesMenuItem}
                    onClick={() => handleOnItemClick(index)}
                    key={index}
                >
                    {elem}
                </StyledMenuItem>)
                )}
            </Menu>
        </div>

    );
}

const mapStateToProps = (state: model.AppState) => ({
    currentProfile: state.currentProfile,
    profiles: state.profiles,
    events: state.events,
    currentView: state.currentView,
});


export default connect(mapStateToProps)(Context.withAppContext(ProfilesMenu));