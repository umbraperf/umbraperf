import * as model from '../../model';
import React from 'react';
import { connect } from 'react-redux';
import Dropzone, { DropzoneState, FileRejection } from 'react-dropzone'
import * as d3 from 'd3';
import styles from '../style/upload.module.css';
import { CircularProgress } from '@material-ui/core';
import { Result } from 'src/model/core_result';
import { IAppContext, withAppContext } from '../../app_context';
import { WebFileController } from '../../controller/web_file_controller';

interface Props {
    appContext: IAppContext;
    file: undefined | File;
    fileName: string | undefined;
    resultLoading: boolean;
    result: Result | undefined;
}

class SwimLanes extends React.Component<Props> {


    constructor(props: Props) {
        super(props);

    }

    createVisualization() {

    }

    componentDidUpdate(prevProps: Props): void {
        if (prevProps.result != this.props.result && undefined != this.props.result && !this.props.resultLoading) {
            //TODO
        }
    }

    componentDidMount(): void {
        //this.createVisualization();
    }

    public render() {
        return <div>

            <div className={"resultArea"} >
                <p>A Swim Lane Componente.</p>
            </div>
        </div>;
    }

}

const mapStateToProps = (state: model.AppState) => ({
    file: state.file,
    fileName: state.fileName,
    resultLoading: state.resultLoading,
    result: state.result,
});


export default connect(mapStateToProps)(withAppContext(SwimLanes));
