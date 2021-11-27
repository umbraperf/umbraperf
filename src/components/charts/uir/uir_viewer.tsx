import * as model from '../../../model';
import * as Context from '../../../app_context';
import styles from '../../../style/uir-viewer.module.css';
import React from 'react';
import { connect } from 'react-redux';
import _ from 'lodash';
import Editor, { Monaco } from "@monaco-editor/react";
import Spinner from '../../utils/spinner/spinner';
import * as monaco from 'monaco-editor';
import UirLinesFoldedToggler from '../../utils/togglers/uir_toggler';


interface AppstateProps {
    appContext: Context.IAppContext;
    chartData: model.IUirViewerData,
    currentEvent: string | "Default";
    events: Array<string> | undefined;
    currentOperator: Array<string> | "All";
    operators: Array<string> | undefined;
}

type Props = model.IUirViewerProps & AppstateProps;

interface State {
    linesFolded: boolean;
    operatorsColored: boolean;
    operatorColorScale: string[];
    hoverProviderDispose: monaco.IDisposable | undefined,
}


class UirViewer extends React.Component<Props, State> {

    editorContainerRef: React.RefObject<HTMLDivElement>;
    editorRef: React.RefObject<unknown>;
    globalEventOccurrenceDecorations: string[];


    constructor(props: Props) {
        super(props);
        this.state = {
            linesFolded: true,
            operatorsColored: true,
            operatorColorScale: model.chartConfiguration.getOperatorColorScheme(this.props.operators!.length, undefined, 0.3),
            hoverProviderDispose: undefined,
        }
        this.handleEditorWillMount = this.handleEditorWillMount.bind(this);
        this.handleEditorDidMount = this.handleEditorDidMount.bind(this);
        this.toggleFoldAllLines = this.toggleFoldAllLines.bind(this);
        this.toggleOperatorsColord = this.toggleOperatorsColord.bind(this);

        this.editorRef = React.createRef();
        this.editorContainerRef = React.createRef();
        this.globalEventOccurrenceDecorations = [];
    }

    componentDidUpdate(prevProps: Props, prevState: State) {

        //Update glyphs when event, currentOperators or operatorColord changes
        if (this.props.currentEvent !== prevProps.currentEvent
            || this.state.operatorsColored !== prevState.operatorsColored
            || !(_.isEqual(this.props.currentOperator, prevProps.currentOperator))) {
            this.setMonacoGlyphs();
        }
    }

    componentWillUnmount() {
        //Remove hover provider on leaving component:
        this.state.hoverProviderDispose?.dispose();
    }

    public render() {
        return <div className={styles.monacoEditorContainer}>

            <div className={styles.uirViewerTitleTogglerContainer}>
                <div className={styles.uirViewerToggler}>
                    {this.createUirViewerLinesFoldedToggler()}
                </div>
                <div className={styles.uirViewerToggler}>
                    {this.createUirViewerOperatorColoredToggler()}
                </div>
                <div className={styles.uirViewerTitle}>
                    UIR Profiler
                </div >
            </div>

            <div
                className={styles.monacoEditor}
                ref={this.editorContainerRef}>
                {this.createMonacoEditor()}
            </div>
        </div >
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
            inherit: true,
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

                "editorHoverWidget.background": '#fff',
                "editorHoverWidget.border": this.props.appContext.secondaryColor,
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
                uirNumberHex: /(0x)\d+/,
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

        //Register a hover provider to umbraIntermediateRepresentation language
        const dispose = monaco.languages.registerHoverProvider('umbraIntermediateRepresentation', {
            provideHover: (model, position) => this.getHoverProviderResult(model, position)
        });
        this.setState((state, props) => ({
            ...state,
            hoverProviderDispose: dispose,
        }));
        // monaco.editor.getModels().forEach(model => model.dispose());

    }

    getHoverProviderResult(model: monaco.editor.ITextModel, position: monaco.Position) {

        const markdownStringHeader: monaco.IMarkdownString = {
            value: `### UIR Line ID: ${position.lineNumber}`,
        };

        const markdownOperator = `- \`Operator:\` ${this.props.chartData.operators[position.lineNumber - 1]} \n`;
        const markdownPipeline = `- \`Pipeline:\` ${this.props.chartData.pipelines[position.lineNumber - 1]} \n`;
        const markdownEvents = this.createMarkdownEventsList(position.lineNumber - 1);


        const markdownStringBody: monaco.IMarkdownString = {
            value: markdownOperator + markdownPipeline + markdownEvents,
        };

        return {
            contents: [markdownStringHeader, markdownStringBody]
        };
    }

    createMarkdownEventsList(eventIndex: number, boldEvent?: number, marginGlyphRepresentation?: boolean) {
        let markdownEventsString = "";
        for (let i = 0; i < 4; i++) {
            let boldCharacter = "";
            if (marginGlyphRepresentation && i + 1 === boldEvent) {
                boldCharacter = "**";
            }
            const markdownEvent = `- ${boldCharacter}\`${this.props.events![i]}:\` ${(this.props.chartData["event" + (i + 1) as "event1" | "event2" | "event3" | "event4"])[eventIndex]}%${boldCharacter} \n`;
            markdownEventsString += markdownEvent;
        }
        return markdownEventsString;

    }

    handleEditorDidMount(editor: any, monaco: Monaco) {
        this.editorRef = editor;
        this.foldAllLines();
        this.setMonacoGlyphs();
    }

    toggleFoldAllLines(event: React.ChangeEvent<HTMLInputElement>) {
        if (event.target.checked) {
            this.setState((state, props) => ({
                ...state,
                linesFolded: true,
            }));
            this.foldAllLines();
        } else {
            this.setState((state, props) => ({
                ...state,
                linesFolded: false,
            }));
            this.unFoldAllLines();
        }
    }

    foldAllLines() {
        (this.editorRef as any).trigger('fold', 'editor.foldAll');
    }

    unFoldAllLines() {
        (this.editorRef as any).trigger('unfold', 'editor.unfoldAll');
    }

    toggleOperatorsColord(event: React.ChangeEvent<HTMLInputElement>) {
        this.setState((state, props) => ({
            ...state,
            operatorsColored: event.target.checked,
        }));
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
            fixedOverflowWidgets: true,
        }

        const monacoEditor =
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
        return monacoEditor;

    }

    createUirViewerLinesFoldedToggler() {
        return <UirLinesFoldedToggler
            uirLinesFolded={this.state.linesFolded}
            togglerLabelText={"Fold Lines"}
            uirViewerTogglerChangeFunction={this.toggleFoldAllLines} />
    }

    createUirViewerOperatorColoredToggler() {
        return <UirLinesFoldedToggler
            uirLinesFolded={this.state.operatorsColored}
            togglerLabelText={"Show Operators: "}
            uirViewerTogglerChangeFunction={this.toggleOperatorsColord} />
    }

    setMonacoGlyphs() {
        if (this.globalEventOccurrenceDecorations.length === 0) {
            this.createInitialColorGlyphs();
        } else {
            this.updateColorGlyphs();
        }

    }

    updateColorGlyphs() {
        const currentEventIndex = this.props.events?.indexOf(this.props.currentEvent);
        const eventNumber = (currentEventIndex && currentEventIndex >= 0) ? currentEventIndex + 1 : 1;
        const eventString = `event${eventNumber}` as "event1" | "event2" | "event3" | "event4";
        const relativeEventString = `relEvent${eventNumber}` as "relEvent1" | "relEvent1" | "relEvent1" | "relEvent1";

        for (let i = 0; i < this.props.chartData.uirLines.length; i++) {

            //Default: No glyph and no glyph margin hover message
            const elemGlyphClasses = [styles.glyphClassWhite, styles.glyphClassWhite];
            let glyphMarginHoverMessage = undefined;

            // color margin glyph for event
            const eventOccurence = (this.props.chartData[eventString])[i];
            const relativeFunctionEventOccurence = (this.props.chartData[relativeEventString])[i];

            if (eventOccurence > 0) {
                const eventOccurenceIsFunctionColorGroup = this.props.chartData.isFunction[i];
                const eventOccurenceRelAbsColorGroup = Math.floor((eventOccurenceIsFunctionColorGroup === 1 ? eventOccurence : relativeFunctionEventOccurence)/10);
                const eventOccurrenceColorGroup = `${eventOccurenceRelAbsColorGroup}`;
                elemGlyphClasses[0] = this.createCustomCssGlyphClass("Event", eventOccurrenceColorGroup);
                glyphMarginHoverMessage = { value: this.createMarkdownEventsList(i, eventNumber, true) };
            }

            //color line glyph for operator
            const operator = this.props.chartData.operators[i];
            if (this.state.operatorsColored
                && this.props.operators!.includes(operator)
                && operator !== "None"
                && (this.props.currentOperator === "All"
                    || this.props.currentOperator.includes(operator))) {
                const operatorColorGroup = this.props.operators!.indexOf(operator);
                elemGlyphClasses[1] = this.createCustomCssGlyphClass("Operator", operatorColorGroup);
            }

            (this.editorRef as any).deltaDecorations([this.globalEventOccurrenceDecorations[i]], [
                {
                    range: new monaco.Range(i + 1, 1, i + 1, 1),
                    options: {
                        isWholeLine: true,
                        glyphMarginClassName: elemGlyphClasses[0],
                        glyphMarginHoverMessage: glyphMarginHoverMessage,
                        className: elemGlyphClasses[1],
                    }
                }
            ]);
        }

    }

    createInitialColorGlyphs() {
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

        this.updateColorGlyphs();
    }

    createCustomCssGlyphClass(glyphClassScaleType: "Event" | "Operator", glyphClassGroupNumber: number | string) {

        //return name of correct css class, create class if not yet created dynamically for operator colors
        const className = `glyphClass${glyphClassScaleType}${glyphClassGroupNumber}`;

        if (glyphClassScaleType === "Operator") {
            if (!this.editorContainerRef.current!.children.namedItem(className)) {
                this.addCssClassForGlyphToDom(className, glyphClassGroupNumber as number);
            }
            return className;
        }else if(glyphClassScaleType == "Event"){
            return styles[className];
        }else{
            return "";
        }

    }

    addCssClassForGlyphToDom(className: string, glyphClassGroupNumber: number) {
        const style = document.createElement('style');
        style.setAttribute("id", className);
        const color = this.state.operatorColorScale[glyphClassGroupNumber];
        style.innerHTML = `.${className} { background: ${color}; }`;
        this.editorContainerRef.current!.appendChild(style);
    }

    // createCustomCssGlyphClass(colorScaleType: "Event" | "Operator", colorGroup: number) {

    //     //return name of correct css class, create class if not yet created
    //     const className = `glyphClass${colorScaleType}${colorGroup}`;

    //     if (this.editorContainerRef.current!.children.namedItem(className)) {
    //         return className;
    //     } else {
    //         const style = document.createElement('style');
    //         style.setAttribute("id", className);
    //         let color = "";
    //         if (colorScaleType === "Event") {
    //             color = model.chartConfiguration.getOrangeColor(colorGroup as 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9);
    //         } else if (colorScaleType === "Operator") {
    //             color = this.state.operatorColorScale[colorGroup];
    //         }
    //         style.innerHTML = `.${className} { background: ${color}; }`;
    //         this.editorContainerRef.current!.appendChild(style);
    //         return className;
    //     }
    // }

}

const mapStateToProps = (state: model.AppState, ownProps: model.IUirViewerProps) => ({
    chartData: state.chartData[ownProps.chartId].chartData.data as model.IUirViewerData,
    currentEvent: state.currentEvent,
    events: state.events,
    currentOperator: state.currentOperator,
    operators: state.operators,
});

export default connect(mapStateToProps, undefined)(Context.withAppContext(UirViewer));
