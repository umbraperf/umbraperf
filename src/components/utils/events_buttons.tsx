import * as model from '../../model';
import * as Context from '../../app_context';
import Spinner from './spinner';
import React, { useContext, useEffect } from 'react';
import { connect } from 'react-redux';
import { Button, InputLabel } from '@material-ui/core';
import styles from '../../style/utils.module.css';


interface Props {
    appContext: Context.IAppContext;
    events: Array<string> | undefined;
    currentEvent: string;
    setCurrentEvent: (newCurrentEvent: string) => void;
}

function EventsButtons(props: Props) {

    const events = props.events;

    useEffect(() => {
        if (events && props.currentEvent === "") {
            props.setCurrentEvent(events[0]);
        }
    });

    const handleEventButtonClick = (event: string) => {
        props.setCurrentEvent(event);
    }

    const createEventShortString = (event: string) => {
        return event.length > 20 ? (event.substr(0, 15) + "...") : event;
    }

    const isComponentLoading = () => {
        if (props.events) {
            return true;
        } else {
            return false;
        }
    }

    return (
        <div className={styles.eventButtonsContainer}>
            {isComponentLoading() ?
                <div>
                    <InputLabel className={styles.eventsButtonsLabel} style={{ color: props.appContext.tertiaryColor }} id="interpolation-selector-label">Events:</InputLabel>
                    <div className={styles.eventButtonsArea}>
                        {events && events!.map((event: string, index: number) => (
                            <Button
                                className={styles.eventButton}
                                variant="contained"
                                color={props.currentEvent === event ? "primary" : "default"}
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
});

const mapDispatchToProps = (dispatch: model.Dispatch) => ({
    setCurrentEvent: (newCurrentEvent: string) => dispatch({
        type: model.StateMutationType.SET_CURRENTEVENT,
        data: newCurrentEvent,
    }),
});

export default connect(mapStateToProps, mapDispatchToProps)(Context.withAppContext(EventsButtons));