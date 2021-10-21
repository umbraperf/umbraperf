import * as model from '../../model';
import * as Context from '../../app_context';
import Spinner from './spinner';
import React, { useContext, useEffect } from 'react';
import { connect } from 'react-redux';
import { Button, Color, InputLabel } from '@material-ui/core';
import styles from '../../style/utils.module.css';


interface Props {
    appContext: Context.IAppContext;
    events: Array<string> | undefined;
    currentEvent: string | "Default";
    currentMultipleEvent: [string, string] | "Default";
    setCurrentEvent: (newCurrentEvent: string) => void;
    setCurrentMultipleEvent: (newCurrentMultipleEvent: [string, string]) => void;

    multipleEvents?: boolean;
}

function EventsButtons(props: Props) {

    const events = props.events;

    useEffect(() => {
        if (events && events.length > 1) {
            if (!props.multipleEvents && props.currentEvent === "Default") {
                props.setCurrentEvent(events[0]);
            }
            if (props.multipleEvents && props.currentMultipleEvent === "Default") {
                props.setCurrentMultipleEvent([events[0], events[1]]);
            }
        }
    });

    const handleEventButtonClick = (event: string) => {
        props.setCurrentEvent(event);
    }

    const createEventShortString = (event: string) => {
        const eventNoPPP = event.includes(':') ? event.slice(0, event.indexOf(':')) : event;
        return eventNoPPP.length > 20 ? (eventNoPPP.substr(0, 15) + "...") : eventNoPPP;
    }

    const isComponentLoading = () => {
        if (props.events) {
            return true;
        } else {
            return false;
        }
    }

    const buttonColor = (event: string) => {
        if (props.multipleEvents) {
            return (props.currentMultipleEvent[0] === event || props.currentMultipleEvent[1] === event) ? "primary" : "default";
        } else {
            return (props.currentEvent === event) ? "primary" : "default";
        }
    }

    return (
        <div className={styles.eventButtonsContainer}>
            {isComponentLoading() ?
                <div>
                    {/* <InputLabel className={styles.eventsButtonsLabel} style={{ color: props.appContext.tertiaryColor }} id="interpolation-selector-label">Events:</InputLabel> */}
                    <div className={styles.eventButtonsArea}>
                        {events && events!.map((event: string, index: number) => (
                            <Button
                                className={styles.eventButton}
                                variant="contained"
                                color={buttonColor(event)}
                                onClick={() => handleEventButtonClick(event)}
                                key={index}
                            >
                                {createEventShortString(event)}
                            </Button>
                        ))}
                    </div>
                </div>
                : <Spinner />
            }
        </div>
    );
}

const mapStateToProps = (state: model.AppState) => ({
    events: state.events,
    currentEvent: state.currentEvent,
    currentMultipleEvent: state.currentMultipleEvent,
});

const mapDispatchToProps = (dispatch: model.Dispatch) => ({
    setCurrentEvent: (newCurrentEvent: string) => dispatch({
        type: model.StateMutationType.SET_CURRENTEVENT,
        data: newCurrentEvent,
    }),
    setCurrentMultipleEvent: (newCurrentMultipleEvent: [string, string]) => dispatch({
        type: model.StateMutationType.SET_CURRENTMULTIPLEEVENT,
        data: newCurrentMultipleEvent,
    }),
});

export default connect(mapStateToProps, mapDispatchToProps)(Context.withAppContext(EventsButtons));