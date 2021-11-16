import * as model from '../../../model';
import * as Context from '../../../app_context';
import styles from '../../../style/charts.module.css';
import React from 'react';
import { connect } from 'react-redux';
import _ from 'lodash';
import Editor from "@monaco-editor/react";
import Spinner from '../../utils/spinner';


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
        return this.createMonacoEditor();
    }

    prepareUirLines() {
        return this.props.chartData.uirLines;
    }

    handleEditorDidMount(editor: any, monaco: any) {

    }

    handleEditorWillMount(monaco: any) {

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
        const tokens = {
            topLevelKeywords: {
                uirKeyword: /define|declare/,
                comments: /'#.*'/,
            },

            // seconedLevelKeywords: {
            //     uirKeyword: ,
            //     uirName: ,
            //     uirLabel: ,
            // },

            thirdLevelKeywords: {
                operators: /add|sub|mul|sdiv|udiv|srem|urem|pow|shl|ashr|lshr|rotl|rotr|and|or|xor|saddoverflow|uaddoverflow|ssuboverflow|usuboverflow|smuloverflow|umuloverflow|overflowresult|crc32|not|neg|isnull|isnotnull|bswap|ctlz|cmpeq|cmpne|cmpslt|cmpsuolt|cmpult|cmpsle|cmpsuole|cmpule|zext|SExt|trunc|fptosi|sitofp|ptrtoint|inttoptr|builddata128|extractdata128|select|getelementptr|load|atomicload|store|atomicstore|atomicrmwadd|atomicrmwxchg|atomicrmwumax|atomiccmpxchg|phi|br|condbr|checkedsadd|checkedssub|checkedsmul/,
                datatypes: /int8|int16|int32|int64|uint8|uint16|uint32|uint64|i8|i16|i32|i64|ptr|d128|data128|void|object\s(\w|:)+/,
            }

        }

        // const seconedLevelKeywords = /const|void|call|functionargument|functionvar|globalref|headerptrpair|unreachable|switch|return/;



        // Register a tokens provider for the language
        monaco.languages.setMonarchTokensProvider('umbraIntermediateRepresentation', {
            tokenizer: {
                root: [
                    [tokens.topLevelKeywords.uirKeyword, 'topLevelKeyword'],
                    [tokens.topLevelKeywords.comments, 'topLevelKeyword'],
                    // [seconedLevelKeywords, 'seconedLevelKeyword'],
                    [tokens.thirdLevelKeywords.operators, 'thirdLevelKeyword'],
                    [tokens.thirdLevelKeywords.datatypes, 'thirdLevelKeyword'],
                    // [ , 'occurrenceValue'],
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
                { token: 'thirdLevelKeyword', foreground: this.props.appContext.accentBlack },
                { token: 'thirdLevelKeyword', foreground: this.props.appContext.tertiaryColor },

            ]
        });

    }

    createMonacoEditor() {

        const monacoDefaultValue = this.props.chartData.uirLines.join('');

        const monacoOptions = {
            readOnly: true,
            scrollBeyondLastLine: false,
            folding: true,
            foldingHighlight: true,
            // foldingStrategy: 'indentation' as "auto" | "indentation" | undefined,
        }

        const monacoEditor = <div
            className={styles.monacoEditorContainer}
        >
            <div className={styles.chartTitle}>UIR Profiler</div>

            <div className={styles.monacoEditor}>
                <Editor
                    key={this.props.key}
                    defaultLanguage="umbraIntermediateRepresentation"
                    theme={"customTheme"}
                    defaultValue={monacoDefaultValue}
                    options={monacoOptions}
                    loading={<Spinner />}
                    beforeMount={this.handleEditorWillMount}
                    onMount={this.handleEditorDidMount}
                />
            </div>
        </div>

        return monacoEditor;

    }

}

const mapStateToProps = (state: model.AppState, ownProps: model.IUirViewerProps) => ({
    chartData: state.chartData[ownProps.chartId].chartData.data as model.IUirViewerData,
});


export default connect(mapStateToProps, undefined)(Context.withAppContext(UirViewer));
