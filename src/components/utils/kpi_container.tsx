import * as model from '../../model';
import * as Controller from '../../controller/request_controller';
import * as Context from '../../app_context';
import styles from '../../style/utils.module.css';
import React from 'react';
import { connect } from 'react-redux';


interface Props {


}

interface State {

}

class KpiContainer extends React.Component<Props, State> {

    constructor(props: Props) {
        super(props);
        this.state = {

        };

    }

    componentDidUpdate(prevProps: Props): void {


    }

    componentDidMount() {

    }



    public render() {

        return <div >
            Test
        </div>;
    }


}

const mapStateToProps = (state: model.AppState) => ({

});

const mapDispatchToProps = (dispatch: model.Dispatch) => ({

});


export default connect(mapStateToProps, mapDispatchToProps)(Context.withAppContext(KpiContainer));
