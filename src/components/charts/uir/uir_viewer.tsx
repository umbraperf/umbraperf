import * as model from '../../../model';
import * as Controller from '../../../controller';
import * as Context from '../../../app_context';
import React from 'react';
import { connect } from 'react-redux';
import _ from 'lodash';
import Editor from "@monaco-editor/react";


interface AppstateProps {
    appContext: Context.IAppContext;
    chartData: model.IUirViewerData,
}

type Props = model.IUirViewerProps & AppstateProps;


class UirViewer extends React.Component<Props, {}> {


    constructor(props: Props) {
        super(props);

    }

    componentDidMount() {
    }

    componentDidUpdate() {

    }

    public render() {
        return <div>
            {this.createMonacoEditor()}
            {this.prepareUirLines()}
        </div>
    }

    prepareUirLines() {
        return this.props.chartData.uirLines;
    }

    createMonacoEditor() {

        const monacoDefaultValue = "//hello world!"

        const monacoOptions = {
            readOnly: true,
        }

        const monacoEditor = <Editor
            height="90vh"
            defaultLanguage="javascript"
            defaultValue={monacoDefaultValue}
            options={monacoOptions}
        />

        return monacoEditor;

    }

}

const mapStateToProps = (state: model.AppState, ownProps: model.IUirViewerProps) => ({
    chartData: state.chartData[ownProps.chartId].chartData.data as model.IUirViewerData,
});


export default connect(mapStateToProps, undefined)(Context.withAppContext(UirViewer));
