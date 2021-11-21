import * as model from '../../../model';
import * as Context from '../../../app_context';
import styles from '../../../style/uir-viewer.module.css';
import React from 'react';
import { connect } from 'react-redux';
import _ from 'lodash';
import Editor, { Monaco } from "@monaco-editor/react";
import Spinner from '../../utils/spinner/spinner';
import * as monaco from 'monaco-editor';

interface AppstateProps {
    appContext: Context.IAppContext;
    chartData: model.IUirViewerData,
    currentEvent: string | "Default";
    events: Array<string> | undefined;

}

type Props = model.IUirViewerProps & AppstateProps;


class UirViewer extends React.Component<Props, {}> {

    editorContainerRef: React.RefObject<HTMLDivElement>;
    editorRef: React.RefObject<unknown>;
    globalEventOccurrenceDecorations: string[];


    constructor(props: Props) {
        super(props);
        this.handleEditorWillMount = this.handleEditorWillMount.bind(this);
        this.handleEditorDidMount = this.handleEditorDidMount.bind(this);
        this.editorRef = React.createRef();
        this.editorContainerRef = React.createRef();
        this.globalEventOccurrenceDecorations = [];
    }

    componentDidMount() {
    }

    componentDidUpdate(prevProps: Props) {

        if (this.props.currentEvent !== prevProps.currentEvent) {
            this.setMonacoGlyphs();
        }

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
        this.editorRef = editor;
        console.log(this.editorRef);
        this.foldAllLines(editor);
        this.setMonacoGlyphs();
    }

    foldAllLines(editor: any) {
        //TODO enable
        // editor.trigger('fold', 'editor.foldAll');
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

            <div className={styles.monacoEditor} ref={this.editorContainerRef}>
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

    setMonacoGlyphs() {
        if (this.globalEventOccurrenceDecorations.length === 0) {
            this.createInitialEventColorGlyphs();
        } else {
            this.updateEventColorGlyphs();
        }

    }

    updateEventColorGlyphs() {
        const currentEventIndex = this.props.events?.indexOf(this.props.currentEvent);
        const eventNumber = (currentEventIndex && currentEventIndex >= 0) ? currentEventIndex + 1 : 1
        const eventString = `event${eventNumber}` as "event1" | "event2" | "event3" | "event4";
        const eventOccurrences = Array.from(this.props.chartData[eventString]);
        console.log(eventOccurrences);
        eventOccurrences.forEach((elem, index) => {
            let currentLineGlyphClass = styles.glyphMarginClassWhite;
            if (elem > 0) {
                const elemColorGroup = Math.floor(elem / 10);
                currentLineGlyphClass = this.createCustomCssGlyphClass(elemColorGroup);

            }
            (this.editorRef as any).deltaDecorations([this.globalEventOccurrenceDecorations[index]], [
                {
                    range: new monaco.Range(index + 1, 1, index + 1, 1),
                    options: {
                        isWholeLine: true,
                        className: currentLineGlyphClass,
                        glyphMarginClassName: currentLineGlyphClass,
                    }
                }
            ]);
        });

    }

    createInitialEventColorGlyphs() {
        // create initial white glyphs for each line
        const initialGlyphs: Array<{ range: monaco.Range, options: object }> = this.props.chartData.uirLines.map((elem, index) => {
            return {
                range: new monaco.Range(index + 1, 1, index + 1, 1),
                options: {
                    isWholeLine: true,
                    className: styles.glyphMarginClassWhite,
                    glyphMarginClassName: styles.glyphMarginClassWhite,
                }
            }
        });

        this.globalEventOccurrenceDecorations = (this.editorRef as any).deltaDecorations(
            [], initialGlyphs
        );

        this.updateEventColorGlyphs();
    }

    createCustomCssGlyphClass(colorGroup: number) {
        //return name of correct css class, create class if not yet created
        
        const className = `glyphMarginClass${colorGroup}`;
        if (this.editorContainerRef.current!.children.namedItem(className)) {
            return className;
        } else {
            const color = model.chartConfiguration.getOrangeColor(colorGroup as any);
            // const className = `glyphMarginClass${colorGroup}`;
            const style = document.createElement('style');
            style.setAttribute("id", `glyphMarginClass${colorGroup}`);
            style.innerHTML = `.${className} { background: ${color}; }`;
            this.editorContainerRef.current!.appendChild(style);
            return className;
        }
    }

}

const mapStateToProps = (state: model.AppState, ownProps: model.IUirViewerProps) => ({
    chartData: state.chartData[ownProps.chartId].chartData.data as model.IUirViewerData,
    currentEvent: state.currentEvent,
    events: state.events,

});

export default connect(mapStateToProps, undefined)(Context.withAppContext(UirViewer));
