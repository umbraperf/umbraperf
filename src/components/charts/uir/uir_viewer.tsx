import * as model from '../../../model';
import * as Controller from '../../../controller';
import * as Context from '../../../app_context';
import React from 'react';
import { connect } from 'react-redux';
import _ from 'lodash';

interface AppstateProps {
    appContext: Context.IAppContext;
    chartData: model.IBarChartActivityHistogramData,
}

type Props = model.IUirViewerProps & AppstateProps;


class UirViewer extends React.Component<Props, {}> {


    constructor(props: Props) {
        super(props);

    }

    componentDidMount(){
    }

    componentDidUpdate(){

    }

    public render() {
        return <p>Will be uir lines</p>
    }

}

const mapStateToProps = (state: model.AppState, ownProps: model.IUirViewerProps) => ({
     chartData: state.chartData[ownProps.chartId].chartData.data as model.IUirViewerData,
});


export default connect(mapStateToProps, undefined)(Context.withAppContext(UirViewer));
