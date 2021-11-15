import * as model from '../../../model';
import * as Controller from '../../../controller';
import * as Context from '../../../app_context';
import React from 'react';
import { connect } from 'react-redux';
import _ from 'lodash';
import Editor from "@monaco-editor/react";
import Spinner from '../../utils/spinner';
import { ThreeSixtyTwoTone } from '@material-ui/icons';



interface AppstateProps {
    appContext: Context.IAppContext;
    chartData: model.IUirViewerData,
}

type Props = model.IUirViewerProps & AppstateProps;


class UirViewer extends React.Component<Props, {}> {


    constructor(props: Props) {
        super(props);

        this.handleEditorWillMount = this.handleEditorWillMount.bind(this);
    }

    public render() {
        return <div>
            {this.createMonacoEditor()}
            {/* {this.prepareUirLines()} */}
        </div>
    }

    prepareUirLines() {
        return this.props.chartData.uirLines;
    }

    handleEditorDidMount(editor: any, monaco: any) {

    }

    handleEditorWillMount(monaco: any) {

        console.log(monaco);

        this.createMonacoCustomTheme(monaco);

        // // Register a tokens provider for the language
        // monaco.languages.setMonarchTokensProvider('additionalTokens', {
        //     tokenizer: {
        //         root: [
        //             [/"(?:[^"\\]|\\.\n{0,})*"/gi, 'my-string'],
        //         ]
        //     }
        // });

        // // Define a new theme that contains only rules that match this language
        // monaco.editor.defineTheme('customTheme', {
        //     base: 'vs',
        //     inherit: false,
        //     rules: [
        //         { token: 'my-string', foreground: '0000FF' },
        //     ]
        // });


        // here is the monaco instance
        // do something before editor is mounted
        // monaco.languages.typescript.javascriptDefaults.setEagerModelSync(true);
    }

    createMonacoCustomTheme(monaco: any) {
        // const definition = () => {
        //     return {
        //         defaultToken: 'invalid',

        //         keywords: [
        //             'define', 'declare'
        //         ],

        //         typeKeywords: [
        //             'array', 'bool', 'char', 'f32', 'f64', 'i16', 'i32', 'i64', 'i8',
        //             'isize', 'pointer', 'slice', 'str', 'tuple', 'u16', 'u32', 'u64', 'u8',
        //             'usize', 'int32'
        //         ],

        //         operators: [
        //             '=', '>', '<', '!', '~', '?', ':',
        //             '==', '<=', '>=', '!=', '&&', '||', '++', '--',
        //             '+', '-', '*', '/', '&', '|', '^', '%', '<<',
        //             '>>', '>>>', '+=', '-=', '*=', '/=', '&=', '|=',
        //             '^=', '%=', '<<=', '>>=', '>>>='
        //         ],

        //         symbols: /[=><!~?:&|+\-*\/^%]+/,
        //         escapes: /\\(?:[abfnrtv\\"']|x[0-9A-Fa-f]{1,4}|u[0-9A-Fa-f]{4}|U[0-9A-Fa-f]{8})/,

        //         // The main tokenizer for our languages
        //         tokenizer: {
        //             root: [
        //                 // identifiers and keywords
        //                 [/[a-z_$][\w$]*/, {
        //                     cases: {
        //                         '@typeKeywords': 'keyword',
        //                         '@keywords': 'keyword',
        //                         '@default': 'identifier'
        //                     }
        //                 }],
        //                 [/[A-Z][\w$]*/, 'type.identifier'],  // to show class names nicely

        //                 // whitespace
        //                 { include: '@whitespace' },

        //                 // delimiters and operators
        //                 [/[{}()\[\]]/, '@brackets'],
        //                 [/[<>](?!@symbols)/, '@brackets'],
        //                 [/@symbols/, {
        //                     cases: {
        //                         '@operators': 'operator',
        //                         '@default': ''
        //                     }
        //                 }],

        //                 [/#!\[[^]*\]/, 'annotation'],
        //                 [/#!.*$/, 'annotation.invalid'],

        //                 // numbers
        //                 [/\d*\.\d+([eE][\-+]?\d+)?[fFdD]?/, 'number.float'],
        //                 [/0[xX][0-9a-fA-F_]*[0-9a-fA-F][Ll]?/, 'number.hex'],
        //                 [/0[0-7_]*[0-7][Ll]?/, 'number.octal'],
        //                 [/0[bB][0-1_]*[0-1][Ll]?/, 'number.binary'],
        //                 [/\d+[lL]?/, 'number'],

        //                 // delimiter: after number because of .\d floats
        //                 [/[;,.]/, 'delimiter'],

        //                 // strings
        //                 [/"([^"\\]|\\.)*$/, 'string.invalid'],  // non-teminated string
        //                 [/"/, 'string', '@string'],

        //                 // characters
        //                 [/'[^\\']'/, 'string'],
        //                 [/(')(@escapes)(')/, ['string', 'string.escape', 'string']],
        //                 [/'/, 'string.invalid']
        //             ],

        //             whitespace: [
        //                 [/[ \t\r\n]+/, 'white'],
        //                 [/\/\*/, 'comment', '@comment'],
        //                 [/\/\/.*$/, 'comment'],
        //             ],

        //             comment: [
        //                 [/[^\/*]+/, 'comment'],
        //                 [/\/\*/, 'comment', '@push'],
        //                 [/\/\*/, 'comment.invalid'],
        //                 ["\\*/", 'comment', '@pop'],
        //                 [/[\/*]/, 'comment']
        //             ],

        //             string: [
        //                 [/[^\\"]+/, 'string'],
        //                 [/@escapes/, 'string.escape'],
        //                 [/\\./, 'string.escape.invalid'],
        //                 [/"/, 'string', '@pop']
        //             ],
        //         },
        //     };
        // }

        //Register new Language
        monaco.languages.register({ id: 'umbraIntermediateRepresentation' });
        // monaco.languages.setMonarchTokensProvider('umbraIntermediateRepresentation', definition());

        //Define Tokens:
        const topLevelKeywords = /define|declare/gi;

        const seconedLevelKeywords = /body/;

        const operators = /void/;

        const datatypes = /int8|int16|int32|int64/gi;

        const occurrenceValues = /[\/*]/gi;

        // Register a tokens provider for the language
        monaco.languages.setMonarchTokensProvider('umbraIntermediateRepresentation', {
            tokenizer: {
                root: [
                    [topLevelKeywords, 'topLevelKeyword'],
                    [seconedLevelKeywords, 'seconedLevelKeyword'],
                    [operators, 'operator'],
                    [datatypes, 'datatype'],
                    [occurrenceValues, 'occurrenceValue'],
                    // [/[^\/*]+/, 'occurrenceValue'],
                    // [/\/\*/, 'occurrenceValue'],  
                    // ["\\*/", 'occurrenceValue'],
                    // [/[\/*]/, 'occurrenceValue']
                ],
            }
        });

        // Define new Theme
        monaco.editor.defineTheme('customTheme', {
            base: 'vs',
            inherit: false,
            rules: [
                { token: 'topLevelKeyword', foreground: this.props.appContext.secondaryColor },
                { token: 'seconedLevelKeyword', foreground: this.props.appContext.primaryColor },
                { token: 'operator', foreground: this.props.appContext.accentBlack },
                { token: 'datatype', foreground: this.props.appContext.tertiaryColor },
                { token: 'occurrenceValue', foreground: this.props.appContext.secondaryColor },

            ]
        });

    }

    createMonacoEditor() {

        //TODO height rerender not working
        console.log(this.props.height)

        const monacoDefaultValue = this.props.chartData.uirLines.join('');

        const monacoOptions = {
            readOnly: true,
            scrollBeyondLastLine: false,
            folding: true,
            foldingHighlight: true,
            // foldingStrategy: 'indentation' as "auto" | "indentation" | undefined,
        }

        const monacoEditor = <Editor
            key={this.props.key}
            height={this.props.height - 15}
            width={this.props.width}
            defaultLanguage="umbraIntermediateRepresentation"
            theme={"customTheme"}
            defaultValue={monacoDefaultValue}
            options={monacoOptions}
            loading={<Spinner />}
            beforeMount={this.handleEditorWillMount}
            onMount={this.handleEditorDidMount}



        />

        return monacoEditor;

    }

}

const mapStateToProps = (state: model.AppState, ownProps: model.IUirViewerProps) => ({
    chartData: state.chartData[ownProps.chartId].chartData.data as model.IUirViewerData,
});


export default connect(mapStateToProps, undefined)(Context.withAppContext(UirViewer));
