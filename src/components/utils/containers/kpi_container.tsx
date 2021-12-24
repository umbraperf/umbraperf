import * as model from '../../../model';
import * as Controller from '../../../controller';
import * as Context from '../../../app_context';
import Spinner from '../spinner/spinner';
import styles from '../../../style/utils.module.css';
import React from 'react';
import { connect } from 'react-redux';
import { Typography } from '@material-ui/core';
import _ from "lodash";
import CountUp from 'react-countup';


interface Props {
    appContext: Context.IAppContext;
    kpis: Array<model.IKpiData> | undefined;
    currentEvent: string,
    currentTimeBucketSelectionTuple: [number, number],
    currentPipeline: Array<string> | "All",
    currentView: model.ViewType;
}

interface State {
    kpiCards: JSX.Element[] | undefined;
}

class KpiContainer extends React.Component<Props, State> {

    constructor(props: Props) {
        super(props);
        this.state = {
            ...this.state,
            kpiCards: undefined,
        }
    }

    componentDidUpdate(prevProps: Props): void {
        this.requestNewChartData(this.props, prevProps);
        this.storeNewKpiCards(prevProps.kpis, prevProps.currentView);

    }

    requestNewChartData(props: Props, prevProps: Props): void {
        if (this.newChartDataNeeded(props, prevProps)) {
            this.setState((state, props) => ({
                ...state,
                kpiCards: undefined,
            }));
            Controller.requestStatistics(this.props.appContext.controller);
        }
    }

    newChartDataNeeded(props: Props, prevProps: Props): boolean {
        if (this.props.currentEvent !== "Default" &&
            (!_.isEqual(props.currentTimeBucketSelectionTuple, prevProps.currentTimeBucketSelectionTuple) ||
                !_.isEqual(props.currentPipeline, prevProps.currentPipeline) ||
                props.currentEvent !== prevProps.currentEvent)) {
            return true;
        } else {
            return false;
        }
    }

    storeNewKpiCards(oldKpis: model.IKpiData[] |undefined, oldView: model.ViewType) {

        if (!_.isEqual(this.props.kpis, oldKpis)) {
            this.setState((state, props) => ({
                ...state,
                kpiCards: this.mapKpiArrayToCards(true),
            }));
        }else if(this.props.kpis && (undefined === oldKpis || this.props.currentView !== oldView)){
            this.setState((state, props) => ({
                ...state,
                kpiCards: this.mapKpiArrayToCards(false),
            }));
        }
    }

    mapKpiArrayToCards(counterEffect: boolean) {
        //get array of kpis from redux, create countup or static element for each and map to multiple cards
        return this.props.kpis!.map((elem, index) => {
            let value = +elem.value;
            let suffix = "";
            let numberDeciamls = 0;

            if (elem.id === "noSamples") {
                const nFormatedString = model.chartConfiguration.nFormatter(+elem.value, 1);
                value = +nFormatedString.slice(0, -1);
                suffix = nFormatedString.slice(-1);
            } else if (elem.id === "execTime") {
                value = Math.round(+elem.value) / 1000;
                suffix = "s";
            } else if (elem.id === "errRate") {
                value = Math.round(+elem.value * 100);
                suffix = "%";
            }

            if(counterEffect){
                const countupValueElement = this.createCountupValue(value, suffix, numberDeciamls);
                return this.createKpiCard(index, elem.title, countupValueElement);
            }else{
                const staticValueElement = this.createStaticValue(value, suffix);
                console.log(staticValueElement);
                return this.createKpiCard(index, elem.title, staticValueElement);
            }
        });

    }

    createCountupValue(value: number, suffix: string, numberDecimals: number) {
        return <CountUp
            start={0}
            end={value}
            duration={1}
            suffix={suffix}
            decimals={numberDecimals}
        />
    }

    createStaticValue(value: number, suffix: string){
        return value + suffix;
    }

    createKpiCard(key: number, title: string, valueElement: JSX.Element | string, isUnfedined?: boolean) {
        return <div key={key} className={styles.kpiCard} >
            <div>
                <Typography className={styles.kpiCardLabel} style={{ color: this.props.appContext.tertiaryColor }}>
                    {title}
                </Typography>
                <Typography className={styles.kpiCardValue} variant="h5" component="div">
                    {isUnfedined ? "-" : valueElement}
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
                    {this.state.kpiCards}
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
    currentView: state.currentView,
});


export default connect(mapStateToProps)(Context.withAppContext(KpiContainer));
