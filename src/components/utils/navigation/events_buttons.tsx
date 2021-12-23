import * as model from '../../../model';
import * as Controller from '../../../controller';
import * as Context from '../../../app_context';
import Spinner from '../spinner/spinner';
import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { Button } from '@material-ui/core';
import styles from '../../../style/utils.module.css';


interface Props {
    appContext: Context.IAppContext;
    events: Array<string> | undefined;
    currentEvent: string | "Default";
    currentMultipleEvent: [string, string] | "Default";
    currentView: model.ViewType;
}

function EventsButtons(props: Props) {

    const events = props.events;
    const [multipleEvents, setMultipleEvents] = useState(false);

    //allow for multiple events selection if multiple events dashboard
    useEffect(() => {
        if (events && props.currentView === model.ViewType.DASHBOARD_MULTIPLE_EVENTS) {
            setMultipleEvents(true);
        } else {
            setMultipleEvents(false);
        }

    }, [props.currentView, events]);

    const handleEventButtonClick = (event: string) => {
        Controller.setEvent(event);
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
        // if (props.currentView === model.ViewType.DASHBOARD_UIR) {
        //     return true;
        // }
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


export default connect(mapStateToProps)(Context.withAppContext(EventsButtons));