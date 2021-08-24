import React, { useCallback, useContext } from 'react';
import { withStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import Menu, { MenuProps } from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import InboxIcon from '@material-ui/icons/MoveToInbox';
import DraftsIcon from '@material-ui/icons/Drafts';
import SendIcon from '@material-ui/icons/Send';
import { useDispatch, useSelector } from 'react-redux';
import { AppState } from '../model/state';
import { ctx } from '../app_context';
import { svgElements } from 'framer-motion/types/render/svg/supported-elements';
import * as model from '../model';




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
            backgroundColor: theme.palette.primary.main,
            '& .MuiListItemIcon-root, & .MuiListItemText-primary': {
                color: theme.palette.common.white,
            },
        },
    },
}))(MenuItem);

export default function EventDropdownMenu() {

    const events = useSelector((state: AppState) => state.events);
    const currentChart = useSelector((state: AppState) => state.currentChart);
    const context = useContext(ctx);
    const dispatch = useDispatch();
    const setNewCurrentEvent = useCallback(
        (newCurrentEvent) => dispatch({
            type: model.StateMutationType.SET_CURRENTEVENT,
            data: newCurrentEvent,
        }),
        [dispatch]
      );

    const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);

    const handleButtonClick = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const handleOnItemClick = (elem: string) => {
        handleClose();
        setNewCurrentEvent(elem);
        context!.controller.calculateChartData(currentChart, elem);

    };

    return (
        <div>
            <Button
                aria-controls="customized-menu"
                aria-haspopup="true"
                variant="contained"
                color="primary"
                onClick={handleButtonClick}
            >
                Choose Event to Visualize
            </Button>

            <StyledMenu
                id="customized-menu"
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleClose}
            >
                {events!.map((elem, index) =>
                (<StyledMenuItem onClick={() => handleOnItemClick(elem)} key={index} selected={false}>
                    <ListItemText primary={elem} />
                </StyledMenuItem>)
                )}
            </StyledMenu>
        </div>
    );
}