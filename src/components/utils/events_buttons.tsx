import React, { useCallback, useContext } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppState } from '../../model/state';
import { ctx } from '../../app_context';
import * as model from '../../model';
import { Button } from '@material-ui/core';
import { SqlQueries } from './../../model/sql_queries';


export default function EventsButtons(props: any) {

    //const events = props.events;
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
        // TODO: wrong request
        context!.controller.calculateChartData(SqlQueries.other);
    }

    //TODO: remove
    const events = ["test 1", "test 2"]

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