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
    kpiValuesFormated: model.IKpiValuesFormated;
    currentEvent: string,
    currentTimeBucketSelectionTuple: [number, number],
    currentPipeline: Array<string> | "All",
    currentView: model.ViewType;
}

class KpiContainer extends React.Component<Props, {}> {

    globalNewKpiValuesFormated: model.IKpiValuesFormated;

    constructor(props: Props) {
        super(props);
        this.globalNewKpiValuesFormated = {};
    }

    shouldComponentUpdate(nextProps: Props) {
        if (!_.isEqual(nextProps.kpiValuesFormated, this.props.kpiValuesFormated)) {
            return false;
        }
        return true;
    }

    componentDidUpdate(prevProps: Props): void {
        this.requestNewChartData(this.props, prevProps);
        this.writeNewFormatedKpisToAppstate(prevProps.kpiValuesFormated);
    }

    writeNewFormatedKpisToAppstate(oldKpiValuesFormated: model.IKpiValuesFormated) {
        if (Object.keys(oldKpiValuesFormated).length === 0 || !_.isEqual(this.globalNewKpiValuesFormated, this.props.kpiValuesFormated)) {
            Controller.setKpiValuesFormated(this.globalNewKpiValuesFormated);
        }
    }

    requestNewChartData(props: Props, prevProps: Props): void {
        if (this.newChartDataNeeded(props, prevProps)) {
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

    mapKpiArrayToCards() {
        //get array of kpis from redux, create countup or static element for each and map to multiple cards
        return this.props.kpis!.map((elem, index) => {
            let value = +elem.value;
            let suffix = "";
            let numberDecimals = 0;

            if (elem.id === "noSamples") {
                const nFormatedString = model.chartConfiguration.nFormatter(+elem.value, 1);
                numberDecimals = nFormatedString.includes(".") ? 1 : 0;
                if (isNaN(+nFormatedString.slice(-1))) {
                    value = +nFormatedString.slice(0, -1);
                    suffix = nFormatedString.slice(-1);
                } else {
                    value = +nFormatedString;
                }
            } else if (elem.id === "execTime") {
                const valueRounded = Math.round(+elem.value);
                suffix = "s";
                if (valueRounded % 1000 === 0) {
                    numberDecimals = 0;
                } else if (valueRounded % 100 === 0) {
                    numberDecimals = 1;
                } else if (valueRounded % 10 === 0) {
                    numberDecimals = 2;
                } else {
                    numberDecimals = 3;
                }
                value = valueRounded / 1000;
            } else if (elem.id === "errRate") {
                value = Math.round(+elem.value * 100);
                suffix = "%";
            }

            this.globalNewKpiValuesFormated = {
                ...this.globalNewKpiValuesFormated,
                [index]: value,
            }

            const countupValueElement = this.createCountupValue(value, suffix, numberDecimals, index);
            return this.createKpiCard(index, elem.title, countupValueElement);;
        });

    }

    createCountupValue(value: number, suffix: string, numberDecimals: number, kpiIndex: number) {
        return <CountUp
            start={this.props.kpiValuesFormated[kpiIndex] ? this.props.kpiValuesFormated[kpiIndex] : 0}
            end={value}
            duration={1}
            suffix={suffix}
            decimals={numberDecimals}
        />
    }

    createKpiCard(key: number, title: string, valueElement: JSX.Element, isUnfedined?: boolean) {
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
                    {this.mapKpiArrayToCards()}
                </div>
            }
        </div>
    }
}

const mapStateToProps = (state: model.AppState) => ({
    kpis: state.kpis,
    kpiValuesFormated: state.kpiValuesFormated,
    currentEvent: state.currentEvent,
    currentTimeBucketSelectionTuple: state.currentTimeBucketSelectionTuple,
    currentPipeline: state.currentPipeline,
    currentView: state.currentView,
});

export default connect(mapStateToProps)(Context.withAppContext(KpiContainer));
