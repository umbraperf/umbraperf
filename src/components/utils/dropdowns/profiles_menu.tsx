import { Button, ListItemIcon, ListItemText, Menu, Tooltip, Typography, withStyles } from '@material-ui/core';
import MenuItem from '@material-ui/core/MenuItem';
import InfoIcon from '@material-ui/icons/Info';
import KeyboardArrowDownIcon from '@material-ui/icons/KeyboardArrowDown';
import React from 'react';
import { connect } from 'react-redux';
import * as Context from '../../../app_context';
import * as Controller from '../../../controller';
import * as model from '../../../model';
import * as styles from "../../../style/utils.module.css";


interface Props {
    appContext: Context.IAppContext;
    currentProfile: model.ProfileType;
    profiles: Array<model.ProfileVariant>;
    events: Array<string> | undefined;
    currentView: model.ViewType;
}

function ProfilesMenu(props: Props) {
    console.log("sets")
    console.log(styles)

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
                {React.createElement(elem.icon, { className: styles.headerMenuItemContentIcon, fontSize: "small" })}
            </ListItemIcon>
            <ListItemText>
                <Typography
                    className={styles.headerMenuItemContentText}
                    variant="body2">
                    {elem.readableName}
                </Typography>
            </ListItemText>
            <ListItemIcon>
                <Tooltip
                    title={
                        <Typography
                            className={styles.headerMenuItemContentInfoTooltipContent}
                            variant="body2">
                            {elem.description}
                        </Typography>
                    }
                    className={styles.headerMenuItemContentInfoTooltipContent}
                >
                    <InfoIcon className={styles.headerMenuItemContentIconInfo} />
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

    const getProfileIndex = (profileType: model.ProfileType) => {
        return props.profiles.findIndex((elem) => (elem.type === profileType));
    }

    const getReadableProfileName = () => {
        const profileIndex = getProfileIndex(props.currentProfile);
        return props.profiles[profileIndex].readableName;
    }

    const isProfileIndexSelected = (index: number) => {
        const currentSelectedProfileIndex = getProfileIndex(props.currentProfile);
        return index === currentSelectedProfileIndex;
    }

    const isMenuDisabled = undefined === props.events || model.ViewType.UPLOAD === props.currentView;

    return (

        <div className={styles.headerMenuContainer}>
            <Button
                className={styles.headerMenuButton}
                classes={{ disabled: styles.headerMenuButtonDisabled }}
                aria-controls="profileMenu"
                aria-haspopup="true"
                onClick={handleClick}
                size="small"
                endIcon={<KeyboardArrowDownIcon />}
                disabled={isMenuDisabled}
            >
                {getReadableProfileName()}
            </Button>

            <Menu
                classes={{ paper: styles.headerMenuPaper }}
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
                    className={styles.headerMenuItem}
                    onClick={() => handleOnItemClick(index)}
                    selected={isProfileIndexSelected(index)}
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