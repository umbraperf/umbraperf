import * as model from './model';
import React from 'react';
import { connect } from 'react-redux';

import styles from './dummy.module.css';

interface Props {
    helloworld: string;
}

class Dummy extends React.Component<Props> {
    public render() {
        return <div>{this.props.helloworld}</div>;
    }

}

const mapStateToProps = (state: model.AppState) => ({
    helloworld: state.helloworld,
});

const mapDispatchToProps = (dispatch: model.Dispatch) => ({
    setHelloWorld: (newGreeter: string) =>
        dispatch({
            type: model.StateMutationType.SET_GREETER,
            data: newGreeter,
        }),
});

export default connect(mapStateToProps, mapDispatchToProps)(Dummy);