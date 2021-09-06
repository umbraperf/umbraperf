import React, { useCallback, useContext } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppState } from '../../model/state';
import { ctx } from '../../app_context';
import * as model from '../../model';
import { Button } from '@material-ui/core';


export default function EventsButtons(props: any) {

    const events = useSelector((state: AppState) => state.events);
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

    const handleEventButtonClick = (event: string) => {
        setNewCurrentEvent(event);
        context!.controller.calculateChartData(props.chartType, event);
    }

    return (
        <div className={"eventButtonsArea"}>
            {events!.map((event, index) => (
                <Button
                    className={"eventButton"}
                    variant="contained"
                    color={currentEvent === event ? "primary" : "default"}
                    onClick={() => handleEventButtonClick(event)}
                    style={{ width: 200, borderRadius: 100, margin: 10 }}
                    key={index}
                >
                    {event}
                </Button>
            ))}
        </div>
    );
}