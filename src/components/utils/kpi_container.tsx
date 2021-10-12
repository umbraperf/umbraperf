import * as model from '../../model';
import * as Controller from '../../controller/request_controller';
import * as Context from '../../app_context';
import Spinner from './spinner';
import styles from '../../style/utils.module.css';
import React from 'react';
import { connect } from 'react-redux';
import { Typography } from '@material-ui/core';
import _ from "lodash";



interface Props {
    appContext: Context.IAppContext;
    kpis: Array<model.IKpiData> | undefined;
    currentEvent: string,
    currentTimeBucketSelectionTuple: [number, number],
    currentPipeline: Array<string> | "All",
    currentChart: string,
}

interface State {
    kpiCards: Array<JSX.Element> | undefined;
}


class KpiContainer extends React.Component<Props, State> {

    constructor(props: Props) {
        super(props);
        this.state = {
            ...this.state,
            kpiCards: undefined,
        };

        this.mapKpiArrayToCards = this.mapKpiArrayToCards.bind(this);
    }

    componentDidMount() {
        
        if (undefined === this.props.kpis && this.props.currentEvent) {
            Controller.requestStatistics(this.props.appContext.controller);
        }

    }

    componentDidUpdate(prevProps: Props, prevState: State): void {

        if (undefined !== this.props.kpis && (!_.isEqual(this.props.kpis, prevProps.kpis) || prevProps.currentChart !== this.props.currentChart)) {
            const kpiCards = this.mapKpiArrayToCards();
            this.setState((state, props) => ({
                ...state,
                kpiCards: kpiCards,
            }));
        }

        if (!_.isEqual(this.props.currentTimeBucketSelectionTuple, prevProps.currentTimeBucketSelectionTuple) ||
                this.props.currentPipeline.length !== prevProps.currentPipeline.length ||
                this.props.currentEvent !== prevProps.currentEvent) {

            Controller.requestStatistics(this.props.appContext.controller);
        }
    }

    mapKpiArrayToCards() {
        //get array of kpis from redux, map to multiple cards
        return this.props.kpis!.map((elem, index) => this.createKpiCard(index, elem.title, elem.value));

    }

    createKpiCard(key: number, title: string, value: string) {
        const valueRounded = Math.round(value as any * 100) / 100
        return <div key={key} className={styles.kpiCard}>
            <div>
                <Typography className={styles.kpiCardLabel} style={{ color: this.props.appContext.tertiaryColor }}>
                    {title}
                </Typography>
                <Typography className={styles.kpiCardValue} variant="h5" component="div">
                    {valueRounded}
                </Typography>
            </div>
        </div>
    }



    public render() {

        return <div className={styles.kpiContainer}>
            {this.props.kpis && this.state.kpiCards ?
                <div className={styles.kpiCardsArea}>
                    {this.state.kpiCards}
                </div>
                : <Spinner />
            }
        </div>
    }


}

const mapStateToProps = (state: model.AppState) => ({
    kpis: state.kpis,
    currentEvent: state.currentEvent,
    currentTimeBucketSelectionTuple: state.currentTimeBucketSelectionTuple,
    currentPipeline: state.currentPipeline,
    currentChart: state.currentChart,

});


export default connect(mapStateToProps)(Context.withAppContext(KpiContainer));
