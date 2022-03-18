import * as model from '../../../model';
import * as Controller from '../../../controller';
import * as Context from '../../../app_context';
import React from 'react';
import MenuItem from '@material-ui/core/MenuItem';
import { Button, ListItemText, Menu, Typography, withStyles } from '@material-ui/core';
import KeyboardArrowDownIcon from '@material-ui/icons/KeyboardArrowDown';
import styles from "../../../style/utils.module.css";
import { connect } from 'react-redux';

const tpchSampleFiles: { readableName: string, name: string }[] = [
    { readableName: "TPCH 10 SF1 (opt)", name: "tpc-h_10_sf1_opt" },
    { readableName: "TPCH 10 SF1 (unopt)", name: "tpc-h_10_sf1_unopt" },
    { readableName: "TPCH 10 SF10 (opt)", name: "tpc-h_10_sf10_opt" },
    { readableName: "TPCH 10 SF10 (unopt)", name: "tpc-h_10_sf10_unopt" },
];

interface Props {
    appContext: Context.IAppContext;
    fileLoading: boolean;
}

function TpchMenu(props: Props) {

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

    const handleOnItemClick = (index: number) => {
        setSelectedTpch(index);
        Controller.resetState();
        fetchTpchUmbraperfSampleFile(index);
        handleClose();
    };

    const [selectedTpch, setSelectedTpch] = React.useState(-1);
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

    const fetchTpchUmbraperfSampleFile = (index: number) => {
        const selectedTpchFileName = tpchSampleFiles[index].name;
        console.log(`https://raw.githubusercontent.com/umbraperf/tpch-samples/main/${selectedTpchFileName}.umbraperf`);
        fetch(`https://raw.githubusercontent.com/umbraperf/tpch-samples/main/${selectedTpchFileName}.umbraperf`, { mode: "cors" })
            .then((response) => {
                return response.blob();
            })
            .then(blob => {
                const file = new File([blob], selectedTpchFileName);
                console.log(file);
                Controller.handleNewFile(file);
                return blob;
            });
    }

    return (

        <div className={`${styles.headerMenuContainer} ${styles.tpchHeaderMenuContainer}`}>
            <Button
                className={styles.headerMenuButton}
                classes={{ disabled: styles.headerMenuButtonDisabled }}
                aria-controls="tpchMenu"
                aria-haspopup="true"
                onClick={handleClick}
                size="small"
                endIcon={<KeyboardArrowDownIcon />}
                disabled={props.fileLoading}
            >
                {selectedTpch < 0 ? "TPC-H Sample Files" : tpchSampleFiles[selectedTpch].readableName}
            </Button>

            <Menu
                classes={{ paper: styles.headerMenuPaper }}
                id="tpchMenu"
                // autoFocus={false}
                disableAutoFocusItem
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
                {tpchSampleFiles.map((elem, index) =>
                (<StyledMenuItem
                    className={styles.headerMenuItem}
                    onClick={() => handleOnItemClick(index)}
                    selected={index === selectedTpch}
                    key={index}
                >
                    <ListItemText>
                        <Typography
                            className={styles.tpchHeaderMenuItemContentText}
                            variant="body2"
                        >
                            {elem.readableName}
                        </Typography>
                    </ListItemText>
                </StyledMenuItem>)
                )}
            </Menu>
        </div>

    );
}

const mapStateToProps = (state: model.AppState) => ({
    fileLoading: state.fileLoading,
});

export default connect(mapStateToProps)(Context.withAppContext(TpchMenu));