import * as model from './model';
import React from 'react';
import { connect } from 'react-redux';

import * as profiler_core from '../crate/pkg';

import styles from './dummy.module.css';

interface Props {
    helloworld: string;
    setHelloWorld: (newGreeter: string) => void;
}

class Dummy extends React.Component<Props> {
    public async passToMichael(event: React.ChangeEvent<HTMLInputElement>) {
        const files = event.target.files;
        if (!files || files?.length == 0 || files![0] == null) return;
        const file = files[0];
        const fileSize = file.size;
        let remaining = fileSize;
        let offset = 0;
        
        while (remaining > 0) {
            const readHere = Math.min(remaining, 4000);
            let chunk = file.slice(offset, offset + readHere);
            const data = await chunk.arrayBuffer();
            console.log(data)
            profiler_core.consumeChunk(new Uint8Array(data));
            remaining -= readHere;
            offset += readHere;
        }
    }

    public render() {
        return <div>
            {this.props.helloworld}<br />
            <button onClick={() => this.props.setHelloWorld("bar")} >SetBar</button>
            <button onClick={() => profiler_core.printSomething("bam")} >CallIntoWasm</button>
            <input type="file" onChange={(args: any) => this.passToMichael(args)} />
        </div>;
    }

}

/* class Dummy extends React.Component<Props> {
    public async passToMichael(event: React.ChangeEvent<HTMLInputElement>) {
        const files = event.target.files;
        if (!files || files?.length == 0 || files![0] == null) return;
        const file = files[0];
        const fileSize = file.size;
        let remaining = fileSize;
        let offset = 0;
        while (remaining > 0) {
            const readHere = Math.min(remaining, 4000);
            let chunk = file.slice(offset, offset + readHere);
            const data = await chunk.arrayBuffer();
            console.log(data)
            profiler_core.consumeChunk(new Uint8Array(data));
            remaining -= readHere;
            offset += readHere;
        }
    }

    public render() {
        return <div>
            {this.props.helloworld}<br />
            <button onClick={() => this.props.setHelloWorld("bar")} >SetBar</button>
            <button onClick={() => profiler_core.printSomething("bam")} >CallIntoWasm</button>
            <input type="file" onChange={(args: any) => this.passToMichael(args)} />
        </div>;
    }

} */

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