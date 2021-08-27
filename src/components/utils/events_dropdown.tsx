import React, { useCallback, useContext } from 'react';
import { createStyles, makeStyles, Theme, withStyles } from '@material-ui/core/styles';
import MenuItem from '@material-ui/core/MenuItem';
import { useDispatch, useSelector } from 'react-redux';
import { AppState } from '../../model/state';
import { ctx } from '../../app_context';
import * as model from '../../model';
import { FormControl } from 'react-bootstrap';
import { InputLabel, Select } from '@material-ui/core';
import styles from "../style/dropdown.module.css";


export default function EventsDropdown() {

    const events = useSelector((state: AppState) => state.events);
    const currentChart = useSelector((state: AppState) => state.currentChart);
    const currentEvent = useSelector((state: AppState) => state.currentEvent);
    const context = useContext(ctx);
    const dispatch = useDispatch();
    const setNewCurrentEvent = useCallback(
        (newCurrentEvent) => dispatch({
            type: model.StateMutationType.SET_CURRENTEVENT,
            data: newCurrentEvent,
        }),
        [dispatch]
    );

    const handleOnItemClick = (elem: string) => {
        setNewCurrentEvent(elem);
        context!.controller.calculateChartData(currentChart, elem);

    };


    return (
        <div className={styles.eventDropdownSelectorContainer}>
            <InputLabel className={styles.eventDropdownSelectorLabel} id="event-selector-label">Choose Event:</InputLabel>
            <Select className={styles.eventDropdownSelector}
                labelId="event-selector-label"
                id="event-selector"
                value={currentEvent}
            >
                {events!.map((elem, index) =>
                (<MenuItem onClick={() => handleOnItemClick(elem)} key={index} value={elem}>{elem}</MenuItem>)
                )}
            </Select>

        </div>
    );
}