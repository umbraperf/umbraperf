import * as model from '../../model';
import * as Controller from '../../controller/request_controller';
import * as Context from '../../app_context';
import styles from '../../style/utils.module.css';
import React from 'react';
import { connect } from 'react-redux';
import { Card, CardContent, Typography } from '@material-ui/core';


interface Props {
    appContext: Context.IAppContext;

}

interface State {
    kpiDataArray: Array<IKpiData>;
}

interface IKpiData {
    title: string,
    body: string,
    explanation: string,
}

class KpiContainer extends React.Component<Props, State> {

    constructor(props: Props) {
        super(props);
        //add 2 dummy cards: 
        this.state = {
            ...this.state,
            kpiDataArray: [{ title: "Test 1", body: "KPI 1", explanation: "Explanation of KPI 1." }, { title: "Test 2", body: "KPI 2", explanation: "Explanation of KPI 2." }],
        };

        this.mapKpiArrayToCards = this.mapKpiArrayToCards.bind(this);
    }

    componentDidUpdate(prevProps: Props): void {

        //Map redux kpi to state kpi? or use directly from redux...


    }

    componentDidMount() {
        //add 2 dummy cards: 
        /*         let dummyKpiData = [{title: "Test 1", body:"KPI 1", explanation:"Explanation of KPI 1."}, {title: "Test 2", body:"KPI 2", explanation:"Explanation of KPI 2."}];
                this.setState((state, props) => ({
                    ...state,
                    kpiDataArray: dummyKpiData,
                })); */
    }

    mapKpiArrayToCards() {
        //get array of kpis from redux, map to multiple cards
        const kpiCardsArray = this.state.kpiDataArray.map(elem => this.createKpiCard(elem.title, elem.body, elem.explanation));
        return kpiCardsArray;
    }

    createKpiCard(title: string, body: string, explanation: string) {
        return <Card className={styles.kpiCard}>
            <CardContent>
                <Typography color="secondary">
                    {title}
                </Typography>
                <Typography variant="h5" component="div">
                    {body}
                </Typography>
                <Typography variant="body2">
                    {explanation}
                </Typography>
            </CardContent>
        </Card>
    }



    public render() {

        return <div className={styles.kpiContainer} >
            {this.state.kpiDataArray && this.mapKpiArrayToCards()}
        </div>;
    }


}

const mapStateToProps = (state: model.AppState) => ({

});

const mapDispatchToProps = (dispatch: model.Dispatch) => ({

});


export default connect(mapStateToProps, mapDispatchToProps)(Context.withAppContext(KpiContainer));
