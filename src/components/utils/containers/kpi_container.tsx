import * as model from '../../../model';
import * as Controller from '../../../controller';
import * as Context from '../../../app_context';
import Spinner from '../spinner/spinner';
import styles from '../../../style/utils.module.css';
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
    chartIdCounter: number,
}

class KpiContainer extends React.Component<Props, {}> {

    constructor(props: Props) {
        super(props);
        this.state = {
            ...this.state,
        };
    }

    componentDidUpdate(prevProps: Props): void {

        this.requestNewChartData(this.props, prevProps);
    }

    requestNewChartData(props: Props, prevProps: Props): void {
        if (this.newChartDataNeeded(props, prevProps)) {
            Controller.requestStatistics(this.props.appContext.controller);
        }
    }

    newChartDataNeeded(props: Props, prevProps: Props): boolean {
        if (this.props.currentEvent !== "Default" &&
            (!_.isEqual(props.currentTimeBucketSelectionTuple, prevProps.currentTimeBucketSelectionTuple) ||
                props.chartIdCounter !== prevProps.chartIdCounter ||
                !_.isEqual(props.currentPipeline, prevProps.currentPipeline) ||
                props.currentEvent !== prevProps.currentEvent)) {
            return true;
        } else {
            return false;
        }
    }

    mapKpiArrayToCards() {
        //get array of kpis from redux, map to multiple cards
        return this.props.kpis!.map((elem, index) => {
            if (elem.id === "noSamples") {
                return this.createKpiCard(index, elem.title, model.chartConfiguration.nFormatter(+elem.value, 1));
            } else if (elem.id === "execTime") {
                const valueRounded = Math.round(+elem.value) / 1000;
                const valueString = valueRounded + "s";
                return this.createKpiCard(index, elem.title, valueString);
            } else if (elem.id === "errRate") {
                const valueString = isNaN(+elem.value) ? "-" : (Math.round(+elem.value * 100) + "%");
                return this.createKpiCard(index, elem.title, valueString);
            } else {
                return this.createKpiCard(index, elem.title, elem.value);
            }
        });

    }

    createKpiCard(key: number, title: string, value: string | number) {
        return <div key={key} className={styles.kpiCard} >
            <div>
                <Typography className={styles.kpiCardLabel} style={{ color: this.props.appContext.tertiaryColor }}>
                    {title}
                </Typography>
                <Typography className={styles.kpiCardValue} key={value} variant="h5" component="div">
                    {value}
                </Typography>
            </div>
        </div>
    }

    isComponentLoading(): boolean {
        if (!this.props.kpis || this.props.kpis.length === 0) {
            return true;
        } else {
            return false;
        }
    }

    public render() {

        return <div className={styles.kpiContainer}>
            {this.isComponentLoading() ?
                <Spinner />
                : <div className={styles.kpiCardsArea}>
                    {this.mapKpiArrayToCards()}
                </div>
            }
        </div>
    }


}

const mapStateToProps = (state: model.AppState) => ({
    kpis: state.kpis,
    currentEvent: state.currentEvent,
    currentTimeBucketSelectionTuple: state.currentTimeBucketSelectionTuple,
    currentPipeline: state.currentPipeline,
    chartIdCounter: state.chartIdCounter,

});


export default connect(mapStateToProps)(Context.withAppContext(KpiContainer));
