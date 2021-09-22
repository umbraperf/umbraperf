import React, { useContext, useEffect } from 'react';
import { connect } from 'react-redux';
import { ctx } from '../../app_context';
import * as model from '../../model';
import { Button } from '@material-ui/core';
import { requestEvents } from '../../controller/request_controller';

interface Props {
    events: Array<string> | undefined;
    currentEvent: string;
    setCurrentEvent: (newCurrentEvent: string) => void;
}

function EventsButtons(props: Props) {

    const context = useContext(ctx);
    const events = props.events;
    if (undefined === events) {
        requestEvents(context!.controller);
    }
    useEffect(() => {
        if(events && props.currentEvent===""){
            props.setCurrentEvent(events[0]);
        }
    });

    const handleEventButtonClick = (event: string) => {
        props.setCurrentEvent(event);
    }

    const createEventShortString = (event: string) => {
        return event.length > 20 ? (event.substr(0, 15) + "...") : event;
    }

    return (
        <div className={"eventButtonsArea"}>
            {events && events!.map((event: string, index: number) => (
                <Button
                    className={"eventButton"}
                    variant="contained"
                    color={props.currentEvent === event ? "primary" : "default"}
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

const mapStateToProps = (state: model.AppState) => ({
    events: state.events,
    currentEvent: state.currentEvent,
});

const mapDispatchToProps = (dispatch: model.Dispatch) => ({
    setCurrentEvent: (newCurrentEvent: string) => dispatch({
        type: model.StateMutationType.SET_CURRENTEVENT,
        data: newCurrentEvent,
    }),
});

export default connect(mapStateToProps, mapDispatchToProps)(EventsButtons)