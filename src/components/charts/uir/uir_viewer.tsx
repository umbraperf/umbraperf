import * as model from '../../../model';
import * as Context from '../../../app_context';
import styles from '../../../style/uir-viewer.module.css';
import React from 'react';
import { connect } from 'react-redux';
import _ from 'lodash';
import Editor, { Monaco } from "@monaco-editor/react";
import Spinner from '../../utils/spinner';
import * as monaco from 'monaco-editor';

interface AppstateProps {
    appContext: Context.IAppContext;
    chartData: model.IUirViewerData,
}

type Props = model.IUirViewerProps & AppstateProps;


class UirViewer extends React.Component<Props, {}> {

    constructor(props: Props) {
        super(props);
        this.handleEditorWillMount = this.handleEditorWillMount.bind(this);
        this.handleEditorDidMount = this.handleEditorDidMount.bind(this);
    }

    componentDidMount() {
        console.log(this.props.chartData);
    }

    public render() {
        return this.createMonacoEditor();
    }

    prepareUirLines() {
        return this.props.chartData.uirLines;
    }

    handleEditorWillMount(monaco: Monaco) {
        this.createUirLanguage(monaco);
        this.createMonacoCustomTheme(monaco);
    }

    createMonacoCustomTheme(monaco: Monaco) {

        const lightColor = (color: string) => {
            return color + "80";
        }

        // Define new Theme
        monaco.editor.defineTheme('uirTheme', {
            base: 'vs',
            inherit: false,
            rules: [
                { token: 'topLevelKeyword', foreground: this.props.appContext.secondaryColor },
                { token: 'seconedLevelKeyword', foreground: this.props.appContext.accentDarkGreen },
                { token: 'thirdLevelKeyword', foreground: this.props.appContext.tertiaryColor },
                { token: 'fourthLevelKeyword', foreground: this.props.appContext.accentDarkBlue },
            ],
            colors: {
                //primary color:
                'editor.findMatchHighlightBackground': this.props.appContext.primaryColor,

                //secondary color:
                'editorCursor.foreground': this.props.appContext.secondaryColor,
                'editorLineNumber.activeForeground': this.props.appContext.secondaryColor,
                'editor.findMatchBackground': lightColor(this.props.appContext.secondaryColor),
                'focusBorder': this.props.appContext.secondaryColor,
                'list.activeSelectionBackground': this.props.appContext.secondaryColor,
                'list.hoverBackground': this.props.appContext.secondaryColor,
                'editor.wordHighlightBackground': lightColor(this.props.appContext.secondaryColor),
                'editor.selectionBackground': lightColor(this.props.appContext.secondaryColor),

                //tertiary color:
                'editorLineNumber.foreground': this.props.appContext.tertiaryColor,
                'editor.lineHighlightBorder': lightColor(this.props.appContext.tertiaryColor),
                'foreground': this.props.appContext.tertiaryColor,
                'editor.selectionHighlightBackground': lightColor(this.props.appContext.tertiaryColor),

                //white color:
                'editor.rangeHighlightBackground': '#fff',
                'list.activeSelectionForeground': '#fff',
                'list.hoverForeground': '#fff',
            }
        });
    }

    createUirLanguage(monaco: Monaco) {
        //Register new Language
        monaco.languages.register({ id: 'umbraIntermediateRepresentation' });

        //Define Tokens:
        const tokens = {
            topLevelKeyword: {
                uirKeyword: /define|declare/,
                comments: /#.*/,
            },

            seconedLevelKeyword: {
                uirKeyword: /call|const|functionargument|functionvar|globalref|headerptrpair|unreachable|switch|return/,
                uirFunctionName: /@\w+/,
                uirName: /%\w+/,
                uirLabel: /^\w+:/,
            },

            thirdLevelKeyword: {
                operators: /\ add\ |\ sub\ |\ mul\ |\ sdiv\ |\ udiv\ |\ srem\ |\ urem\ |\ pow\ |\ shl\ |\ ashr\ |\ lshr\ |\ rotl\ |\ rotr\ |\ and\ |\ or\ |\ xor\ |\ saddoverflow\ |\ uaddoverflow\ |\ ssuboverflow\ |\ usuboverflow\ |\ smuloverflow\ |\ umuloverflow\ |\ overflowresult\ |\ crc32\ |\ not\ |\ neg\ |\ isnull\ |\ isnotnull\ |\ bswap\ |\ ctlz\ |\ cmpeq\ |\ cmpne\ |\ cmpslt\ |\ cmpsuolt\ |\ cmpult\ |\ cmpsle\ |\ cmpsuole\ |\ cmpule\ |\ zext\ |\ SExt\ |\ trunc\ |\ fptosi\ |\ sitofp\ |\ ptrtoint\ |\ inttoptr\ |\ builddata128\ |\ extractdata128\ |\ select\ |\ getelementptr\ |\ load\ |\ atomicload\ |\ store\ |\ atomicstore\ |\ atomicrmwadd\ |\ atomicrmwxchg\ |\ atomicrmwumax\ |\ atomiccmpxchg\ |\ phi\ |\ br\ |\ condbr\ |\ checkedsadd\ |\ checkedssub\ |\ checkedsmul\ /,
                datatypes: /int8|int16|int32|int64|uint8|uint16|uint32|uint64|i8|i16|i32|i64|ptr|d128|data128|void|object\s(\w|:)+ /,

            },

            fourthLevelKeyword: {
                uirString: /".*"/,
                uirNumber: /0x[a-zA-Z0-9]+/,
                //TODO further number in vim file?
            }

        }

        // Register a tokens provider for the language
        let tokenizerRoot: Array<[RegExp, string]> = [];
        for (let tokenLevelName in tokens) {
            const tokenLevel = (tokens as any)[tokenLevelName];
            for (let token in tokenLevel) {
                tokenizerRoot.push([(tokenLevel as any)[token], tokenLevelName]);
            }
        }
        monaco.languages.setMonarchTokensProvider('umbraIntermediateRepresentation', {
            tokenizer: {
                root: tokenizerRoot
            }
        });

    }

    handleEditorDidMount(editor: any, monaco: Monaco) {
        this.foldAllLines(editor);
        this.setMonacoGlyphs(editor);
    }

    foldAllLines(editor: any) {
        editor.trigger('fold', 'editor.foldAll');
    }

    createMonacoEditor() {

        const monacoDefaultValue = this.props.chartData.uirLines.join('');

        const monacoOptions = {
            readOnly: true,
            scrollBeyondLastLine: false,
            folding: true,
            foldingHighlight: false,
            fontSize: 11,
            color: this.props.appContext.accentBlack,
            glyphMargin: true,
        }

        const monacoEditor = <div className={styles.monacoEditorContainer}>

            <div className={styles.chartTitle}>UIR Profiler</div>

            <div className={styles.monacoEditor}>
                <Editor
                    key={this.props.key}
                    defaultLanguage="umbraIntermediateRepresentation"
                    theme={"uirTheme"}
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

    setMonacoGlyphs(editor: any) {
        const glyps = this.createEventColorGlyphs(1);
        console.log(glyps);
        const decorations = editor.deltaDecorations(
            [], glyps
        );
    }

    createEventColorGlyphs(event: 1 | 2 | 3 | 4) {
        const eventString = `event${event}` as "event1" | "event2" | "event3" | "event4";
        const eventOccurrences = Array.from(this.props.chartData[eventString]);

        console.log(this.props.chartData.event1.length);
        console.log(this.props.chartData.uirLines.length);

        let glyps: Array<{ range: monaco.Range, options: object }> = [];
        eventOccurrences.forEach((elem, index) => {
            if (elem > 0) {
                console.log(elem);
                const elemColorGroup = Math.floor(elem / 10);
                const cssClass = this.createCustomCssGlyphClass(elemColorGroup);
                glyps.push(
                    {
                        range: new monaco.Range(index + 1, 1, index + 1, 1),
                        options: {
                            isWholeLine: true,
                            className: cssClass, //line background of range
                            glyphMarginClassName: cssClass, // glyph
                            // className: styles[`glyphMarginClass${elemColorGroup}`], //line background of range
                            // glyphMarginClassName: styles[`glyphMarginClass${elemColorGroup}`], // glyph
                        }
                    }
                )
            }
        });

        return glyps;

    }

    createCustomCssGlyphClass(colorGroup: number) {
        const color = model.chartConfiguration.getOrangeColor(colorGroup as any);
        const className = `glyphMarginClass${colorGroup}`;
        const style = document.createElement('style');
        style.innerHTML = `.${className} { background: ${color}; }`;
        document.getElementsByTagName('head')[0].appendChild(style);
        return className;
    }

}

const mapStateToProps = (state: model.AppState, ownProps: model.IUirViewerProps) => ({
    chartData: state.chartData[ownProps.chartId].chartData.data as model.IUirViewerData,
});

export default connect(mapStateToProps, undefined)(Context.withAppContext(UirViewer));
