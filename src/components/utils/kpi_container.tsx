import * as model from '../../model';
import * as Controller from '../../controller/request_controller';
import * as Context from '../../app_context';
import styles from '../../style/utils.module.css';
import React from 'react';
import { connect } from 'react-redux';
import { Card, CardContent, Typography } from '@material-ui/core';


interface Props {
    appContext: Context.IAppContext;
    kpis: Array<model.IKpiData> | undefined;
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

    componentDidMount() {
    
        if(undefined === this.props.kpis){
            Controller.requestStatistics(this.props.appContext.controller);
        }
    }

    mapKpiArrayToCards() {
        //get array of kpis from redux, map to multiple cards
        const kpiCardsArray = this.state.kpiDataArray.map((elem, index) => this.createKpiCard(index, elem.title, elem.body));
        return kpiCardsArray;
    }

    createKpiCard(key: number, title: string, body: string) {
        return <Card key={key} className={styles.kpiCard}>
            <CardContent>
                <Typography style={{color: this.props.appContext.tertiaryColor}}>
                    {title}
                </Typography>
                <Typography variant="h5" component="div">
                    {body}
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
    kpis: state.kpis,

});


export default connect(mapStateToProps)(Context.withAppContext(KpiContainer));
