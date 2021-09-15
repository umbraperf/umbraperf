import React, { useCallback, useContext } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppState } from '../../model/state';
import { ctx } from '../../app_context';
import * as model from '../../model';
import { Button } from '@material-ui/core';
import { RestQueryType } from '../../model/rest_queries';


export default function EventsButtons(props: any) {

    const events = props.events as Array<any>;
    const currentEvent = useSelector((state: AppState) => state.currentEvent);
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
    }

    const createEventShortString = (event: string) => {
        return event.length > 20 ? (event.substr(0, 15) + "...") : event;
    }

    return (
        <div className={"eventButtonsArea"}>
            {events!.map((event, index) => (
                <Button
                    className={"eventButton"}
                    variant="contained"
                    color={currentEvent === event ? "primary" : "default"}
                    onClick={() => handleEventButtonClick(event)}
                    style={{ width: 150, borderRadius: 70, margin: 7, fontSize: '12px' }}
                    key={index}
                >
                    {createEventShortString(event)}
                </Button>
            ))}
        </div>
    );
}