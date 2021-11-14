import * as model from '../../model';
import * as Context from '../../app_context';
import Spinner from './spinner';
import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { Button, useTheme } from '@material-ui/core';
import styles from '../../style/utils.module.css';


interface Props {
    appContext: Context.IAppContext;
    events: Array<string> | undefined;
    currentEvent: string | "Default";
    currentMultipleEvent: [string, string] | "Default";
    currentView: model.ViewType;
    setCurrentEvent: (newCurrentEvent: string) => void;
    setCurrentMultipleEvent: (newCurrentMultipleEvent: [string, string]) => void;
}

function EventsButtons(props: Props) {

    const events = props.events;
    const [multipleEvents, setMultipleEvents] = useState(false);

    useEffect(() => {
        if (events && events.length > 1) {
            if (!multipleEvents && props.currentEvent === "Default") {
                props.setCurrentEvent(events[0]);
            }
            if (multipleEvents && props.currentMultipleEvent === "Default") {
                props.setCurrentMultipleEvent([events[0], events[1]]);
            }
        }
    }, []);

    //automatically change event to memory loads if available on change to memory dashboard, allow for multiple events selection if multiple events dashboard
    useEffect(() => {

        if (events && props.currentView === model.ViewType.DASHBOARD_MEMORY) {
            console.log(props.currentView);

            if (events.includes("mem_inst_retired.all_loads")) {
                handleEventButtonClick("mem_inst_retired.all_loads");
            }
        }

        if (events && props.currentView === model.ViewType.DASHBOARD_MULTIPLE_EVENTS) {
            setMultipleEvents(true);
        } else {
            setMultipleEvents(false);
        }

    }, [props.currentView, events]);

    const handleEventButtonClick = (event: string) => {
        props.setCurrentEvent(event);
        const newMultipleEventsTuple: [string, string] = [event, props.currentMultipleEvent[0]];
        props.setCurrentMultipleEvent(newMultipleEventsTuple);
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
        if (multipleEvents) {
            if (props.currentMultipleEvent[0] === event) {
                return "secondary";
            } else if (props.currentMultipleEvent[1] === event) {
                return "primary";
            } else {
                return "default";
            }
        } else {
            return (props.currentEvent === event) ? "secondary" : "default";
        }
    }

    const isButtonDisabled = (event: string) => {
        if (props.currentView === model.ViewType.DASHBOARD_MEMORY && event === "cycles:ppp") {
            return true;
        }
        if (props.currentView === model.ViewType.DASHBOARD_UIR) {
            return true;
        }
        return false;
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
                                disabled={isButtonDisabled(event)}
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
    currentView: state.currentView,
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