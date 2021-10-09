import * as model from '../../model';
import * as Controller from '../../controller/request_controller';
import * as Context from '../../app_context';
import Spinner from './spinner';
import styles from '../../style/utils.module.css';
import React from 'react';
import { connect } from 'react-redux';
import { Card, CardContent, Typography } from '@material-ui/core';
import _ from "lodash";



interface Props {
    appContext: Context.IAppContext;
    kpis: Array<model.IKpiData> | undefined;
}

interface State {
    kpiCards: Array<JSX.Element>;
}


class KpiContainer extends React.Component<Props, State> {

    constructor(props: Props) {
        super(props);
        //add 2 dummy cards: 
        this.state = {
            ...this.state,
        };

        this.mapKpiArrayToCards = this.mapKpiArrayToCards.bind(this);
    }

    componentDidMount() {

        if (undefined === this.props.kpis) {
            Controller.requestStatistics(this.props.appContext.controller);
        }
    }

    componentDidUpdate(prevProps: Props, prevState: State): void {
        if (undefined !== this.props.kpis && !_.isEqual(this.props.kpis, prevProps.kpis)) {
            const kpiCards = this.mapKpiArrayToCards();

            this.setState((state, props) => ({
                ...state,
                kpiCards: kpiCards,
            }));
        }
    }

    mapKpiArrayToCards() {
        //get array of kpis from redux, map to multiple cards
        return this.props.kpis!.map((elem, index) => this.createKpiCard(index, elem.title, elem.value));

    }

    createKpiCard(key: number, title: string, body: string) {
        return <Card key={key} className={styles.kpiCard}>
            <CardContent>
                <Typography style={{ color: this.props.appContext.tertiaryColor }}>
                    {title}
                </Typography>
                <Typography variant="h5" component="div">
                    {body}
                </Typography>
            </CardContent>
        </Card>
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

});


export default connect(mapStateToProps)(Context.withAppContext(KpiContainer));
