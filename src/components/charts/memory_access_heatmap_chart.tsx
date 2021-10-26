// import * as model from '../../model';
// import * as Controller from '../../controller/request_controller';
// import * as Context from '../../app_context';
// import Spinner from '../utils/spinner';
// import React from 'react';
// import { connect } from 'react-redux';
// import { SignalListeners, Vega } from 'react-vega';
// import { VisualizationSpec } from "react-vega/src";
// import { Redirect } from 'react-router-dom';
// import { createRef } from 'react';
// import _, { reverse } from "lodash";


// interface Props {
//     appContext: Context.IAppContext;
//     resultLoading: model.ResultLoading;
//     result: model.Result | undefined;
//     csvParsingFinished: boolean;
//     currentChart: string;
//     currentEvent: string;
//     events: Array<string> | undefined;
//     chartIdCounter: number;
//     chartData: model.ChartDataKeyValue,
//     currentPipeline: Array<string> | "All";
//     currentOperator: Array<string> | "All";
//     operators: Array<string> | undefined;
//     currentBucketSize: number,
//     currentTimeBucketSelectionTuple: [number, number],
//     setCurrentChart: (newCurrentChart: string) => void;
//     setChartIdCounter: (newChartIdCounter: number) => void;
//     setCurrentEvent: (newCurrentEvent: string) => void;
// }

// interface State {
//     chartId: number,
// }

// class MemoryAccessHeatmapChart extends React.Component<Props, State> {

//     elementWrapper = createRef<HTMLDivElement>();

//     constructor(props: Props) {
//         super(props);
//         this.state = {
//             chartId: this.props.chartIdCounter,
//         };
//         this.props.setChartIdCounter((this.state.chartId) + 1);

//         this.createVisualizationSpec = this.createVisualizationSpec.bind(this);
//     }

//     componentDidUpdate(prevProps: Props): void {
//         this.setDefaultEventToMemLoads(this.props, prevProps);
//         this.requestNewChartData(this.props, prevProps);
//     }

//     setDefaultEventToMemLoads(props: Props, prevProps: Props) {
//         console.log(prevProps.chartData[this.state.chartId]);
//         //only set bevore first time data requestes and if available memloads are in events and events available
//         if (props.events && props.events.includes("mem_inst_retired.all_loads") && !prevProps.chartData[this.state.chartId]) {
//             props.setCurrentEvent("mem_inst_retired.all_loads");
//         }
//     }

//     requestNewChartData(props: Props, prevProps: Props): void {
//         if (this.newChartDataNeeded(props, prevProps)) {
//             Controller.requestChartData(props.appContext.controller, this.state.chartId, model.ChartType.MEMORY_ACCESS_HEATMAP_CHART);
//         }
//     }

//     newChartDataNeeded(props: Props, prevProps: Props): boolean {
//         if (props.events &&
//             props.operators &&
//             (props.chartIdCounter !== prevProps.chartIdCounter ||
//                 props.currentBucketSize !== prevProps.currentBucketSize ||
//                 props.currentEvent !== prevProps.currentEvent ||
//                 !_.isEqual(props.operators, prevProps.operators) ||
//                 !_.isEqual(props.currentTimeBucketSelectionTuple, prevProps.currentTimeBucketSelectionTuple))) {
//             return true;
//         } else {
//             return false;
//         }
//     }

//     componentDidMount() {

//         if (this.props.csvParsingFinished) {
//             this.props.setCurrentChart(model.ChartType.MEMORY_ACCESS_HEATMAP_CHART);
//         }
//     }


//     isComponentLoading(): boolean {
//         if (this.props.resultLoading[this.state.chartId] || !this.props.chartData[this.state.chartId] || !this.props.operators) {
//             return true;
//         } else {
//             return false;
//         }
//     }

//     public render() {

//         if (!this.props.csvParsingFinished) {
//             return <Redirect to={"/upload"} />
//         }

//         return <div ref={this.elementWrapper} style={{ display: "flex", height: "100%" }}>
//             {this.isComponentLoading()
//                 ? <Spinner />
//                 : <div className={"vegaContainer"}>
//                     {this.renderChartPerOperator()}
//                 </div>
//             }
//         </div>;
//     }

//     renderChartPerOperator() {
//         const preparedData = this.prepareData();
//         const domains = preparedData.domains;
//         const dataFlattend = preparedData.dataFlattend;

//         const dataFlattendFiltered = (curOp: string) => {
//             const filteredData = dataFlattend.filter(elem => (elem.operator === curOp));
//             return filteredData;
//         }

//         return this.props.operators!.map((elem, index) => (<Vega className={`vegaMemoryHeatmap-${elem}`} key={index} spec={this.createVisualizationSpec(elem, domains, dataFlattendFiltered(elem))} />));
//     }

//     prepareData() {
//         const operatorArray = ((this.props.chartData[this.state.chartId] as model.ChartDataObject).chartData.data as model.IMemoryAccessHeatmapChart).operator;
//         const bucketsArray = Array.from(((this.props.chartData[this.state.chartId] as model.ChartDataObject).chartData.data as model.IMemoryAccessHeatmapChart).buckets);
//         const memoryAdressArray = Array.from(((this.props.chartData[this.state.chartId] as model.ChartDataObject).chartData.data as model.IMemoryAccessHeatmapChart).memoryAdress);
//         const occurrencesArray = Array.from(((this.props.chartData[this.state.chartId] as model.ChartDataObject).chartData.data as model.IMemoryAccessHeatmapChart).occurrences);

//         const dataFlattend: Array<{ operator: string, bucket: number, memAdr: number, occurrences: number }> = [];
//         operatorArray.forEach((op, index) => {
//             dataFlattend.push({
//                 operator: op,
//                 bucket: bucketsArray[index],
//                 memAdr: memoryAdressArray[index],
//                 occurrences: occurrencesArray[index],
//             });
//         }
//         );

//         const domains = {
//             bucketDomain: Math.max(...bucketsArray),
//             memDomain: _.sortBy(memoryAdressArray),
//             occurrencesDomain: [Math.min(...occurrencesArray), Math.max(...occurrencesArray)],
//             // memDomain: [Math.min(...memoryAdressArray), Math.max(...memoryAdressArray)],
//         }

//         // const domains = {
//         //     bucketDomain: bucketsArray,
//         //     memDomain: memoryAdressArray,
//         //     occurrencesDomain: occurrencesArray,
//         // }

//         return { dataFlattend, domains }
//     }

//     createVisualizationData(dataFlattendFiltered: any) {

//         const data = [
//             {
//                 name: "table",
//                 values: dataFlattendFiltered,
//             },
//         ]
//         return data;
//     }

//     createVisualizationSpec(operator: string, domains: any, dataFlattendFiltered: Array<any>) {
//         const visData = this.createVisualizationData(dataFlattendFiltered);

//         console.log(domains);
//         console.log(visData);

//         const spec: VisualizationSpec = {
//             $schema: "https://vega.github.io/schema/vega/v5.json",
//             width: 400,
//             height: 300,
//             padding: { left: 5, right: 5, top: 10, bottom: 10 },
//             autosize: { type: "fit", resize: false },

//             title: {
//                 text: `Memory Access Heatmap: ${operator}`,
//                 align: model.chartConfiguration.titleAlign,
//                 dy: model.chartConfiguration.titlePadding,
//                 fontSize: model.chartConfiguration.titleFontSize,
//                 font: model.chartConfiguration.titleFont,
//             },

//             // data: visData,
//             data: visData,

//             "scales": [
//                 {
//                     "name": "x",
//                     "type": "linear",
//                     "domain": [0, domains.bucketDomain],
//                     "range": "width",
//                     // "zero": true,
//                     // "nice": true,
//                     // "round": true,
//                 },
//                 {
//                     "name": "y",
//                     "type": "band",
//                     "domain": domains.memDomain,
//                     "range": "height",
//                     "zero": true,
//                     "nice": true,
//                     "round": true,
//                     reverse: true,
//                 },
//                 {
//                     "name": "color",
//                     "type": "linear",
//                     "range": { "scheme": "Viridis" },
//                     domain: {
//                         data: "table",
//                         field: "occurrences"
//                     },
//                     // "domain": domains.occurrencesDomain,
//                     "zero": true,
//                 }
//             ],

//             "axes": [
//                 {
//                     "orient": "bottom",
//                     "scale": "x",
//                     labelOverlap: true,
//                     //values: xTicks(),
//                     title: model.chartConfiguration.memoryChartXTitle,
//                     titlePadding: model.chartConfiguration.axisPadding,
//                     labelFontSize: model.chartConfiguration.axisLabelFontSize,
//                     titleFontSize: model.chartConfiguration.axisTitleFontSize,
//                     titleFont: model.chartConfiguration.axisTitleFont,
//                     labelFont: model.chartConfiguration.axisLabelFont,
//                     labelSeparation: model.chartConfiguration.memoryChartXLabelSeparation,
//                 },
//                 {
//                     orient: "left",
//                     scale: "y",
//                     zindex: 1,
//                     title: model.chartConfiguration.memoryChartYTitle,
//                     titlePadding: model.chartConfiguration.axisPadding,
//                     labelFontSize: model.chartConfiguration.axisLabelFontSize,
//                     labelSeparation: model.chartConfiguration.memoryChartYLabelSeparation,
//                     labelOverlap: true,
//                     titleFontSize: model.chartConfiguration.axisTitleFontSize,
//                     titleFont: model.chartConfiguration.axisTitleFont,
//                     labelFont: model.chartConfiguration.axisLabelFont,
//                 }
//             ],

//             "marks": [
//                 {
//                     "type": "rect",
//                     "encode": {
//                         "enter": {
//                             "x": { "value": 0 },
//                             "y": { "value": 0 },
//                             "width": { "signal": "width" },
//                             "height": { "signal": "height" },
//                             "fill": { "scale": "color", "value": "0" }
//                         }
//                     }
//                 },
//                 {
//                     "type": "rect",
//                     "from": { "data": "table" },
//                     "encode": {
//                         "enter": {
//                             "x": { "scale": "x", "field": "bucket" },
//                             "y": { "scale": "y", "field": "memAdr" },
//                             "width": { "value": 5 },
//                             "height": { "scale": "y", "band": 1 },
//                             tooltip: {
//                                 signal: `{'Operator': '${operator}', ${model.chartConfiguration.memoryChartTooltip}}`,
//                             },
//                         },
//                         "update": {
//                             "fill": { "scale": "color", "field": "occurrences" }
//                         }
//                     }
//                 }
//             ],

//             "legends": [
//                 {
//                     "fill": "color",
//                     "type": "gradient",
//                     "title": "Number of Accesses",
//                     titleFontSize: model.chartConfiguration.legendTitleFontSize,
//                     "titlePadding": 4,
//                     "gradientLength": { "signal": "height - 20" }
//                 }
//             ],
//         } as VisualizationSpec;

//         return spec;
//     }

// }

// const mapStateToProps = (state: model.AppState) => ({
//     resultLoading: state.resultLoading,
//     result: state.result,
//     csvParsingFinished: state.csvParsingFinished,
//     currentChart: state.currentChart,
//     currentEvent: state.currentEvent,
//     events: state.events,
//     chartIdCounter: state.chartIdCounter,
//     chartData: state.chartData,
//     currentPipeline: state.currentPipeline,
//     currentOperator: state.currentOperator,
//     operators: state.operators,
//     currentTimeBucketSelectionTuple: state.currentTimeBucketSelectionTuple,
//     currentBucketSize: state.currentBucketSize,

// });

// const mapDispatchToProps = (dispatch: model.Dispatch) => ({
//     setCurrentChart: (newCurrentChart: string) => dispatch({
//         type: model.StateMutationType.SET_CURRENTCHART,
//         data: newCurrentChart,
//     }),
//     setChartIdCounter: (newChartIdCounter: number) => dispatch({
//         type: model.StateMutationType.SET_CHARTIDCOUNTER,
//         data: newChartIdCounter,
//     }),
//     setCurrentEvent: (newCurrentEvent: string) => dispatch({
//         type: model.StateMutationType.SET_CURRENTEVENT,
//         data: newCurrentEvent,
//     })
// });


// export default connect(mapStateToProps, mapDispatchToProps)(Context.withAppContext(MemoryAccessHeatmapChart));









//image version relative per graph:
import * as model from '../../model';
import * as Controller from '../../controller/request_controller';
import * as Context from '../../app_context';
import Spinner from '../utils/spinner';
import React from 'react';
import { connect } from 'react-redux';
import { SignalListeners, Vega } from 'react-vega';
import { VisualizationSpec } from "react-vega/src";
import { Redirect } from 'react-router-dom';
import { createRef } from 'react';
import _, { reverse } from "lodash";


interface Props {
    appContext: Context.IAppContext;
    resultLoading: model.ResultLoading;
    result: model.Result | undefined;
    csvParsingFinished: boolean;
    currentChart: string;
    currentEvent: string;
    events: Array<string> | undefined;
    chartIdCounter: number;
    chartData: model.ChartDataKeyValue,
    currentPipeline: Array<string> | "All";
    currentOperator: Array<string> | "All";
    operators: Array<string> | undefined;
    currentBucketSize: number,
    currentTimeBucketSelectionTuple: [number, number],
    setCurrentChart: (newCurrentChart: string) => void;
    setChartIdCounter: (newChartIdCounter: number) => void;
    setCurrentEvent: (newCurrentEvent: string) => void;
}

interface State {
    chartId: number,
}

class MemoryAccessHeatmapChart extends React.Component<Props, State> {

    elementWrapper = createRef<HTMLDivElement>();

    constructor(props: Props) {
        super(props);
        this.state = {
            chartId: this.props.chartIdCounter,
        };
        this.props.setChartIdCounter((this.state.chartId) + 1);

        this.createVisualizationSpec = this.createVisualizationSpec.bind(this);
    }

    componentDidUpdate(prevProps: Props): void {
        this.setDefaultEventToMemLoads(this.props, prevProps);
        this.requestNewChartData(this.props, prevProps);
    }

    setDefaultEventToMemLoads(props: Props, prevProps: Props) {
        console.log(prevProps.chartData[this.state.chartId]);
        //only set bevore first time data requestes and if available memloads are in events and events available
        if (props.events && props.events.includes("mem_inst_retired.all_loads") && !prevProps.chartData[this.state.chartId]) {
            props.setCurrentEvent("mem_inst_retired.all_loads");
        }
    }

    requestNewChartData(props: Props, prevProps: Props): void {
        if (this.newChartDataNeeded(props, prevProps)) {
            Controller.requestChartData(props.appContext.controller, this.state.chartId, model.ChartType.MEMORY_ACCESS_HEATMAP_CHART);
        }
    }

    newChartDataNeeded(props: Props, prevProps: Props): boolean {
        if (props.events &&
            props.operators &&
            (props.chartIdCounter !== prevProps.chartIdCounter ||
                props.currentBucketSize !== prevProps.currentBucketSize ||
                props.currentEvent !== prevProps.currentEvent ||
                !_.isEqual(props.operators, prevProps.operators) ||
                !_.isEqual(props.currentTimeBucketSelectionTuple, prevProps.currentTimeBucketSelectionTuple))) {
            return true;
        } else {
            return false;
        }
    }

    componentDidMount() {

        if (this.props.csvParsingFinished) {
            this.props.setCurrentChart(model.ChartType.MEMORY_ACCESS_HEATMAP_CHART);
        }
    }


    isComponentLoading(): boolean {
        if (this.props.resultLoading[this.state.chartId] || !this.props.chartData[this.state.chartId] || !this.props.operators) {
            return true;
        } else {
            return false;
        }
    }

    public render() {

        if (!this.props.csvParsingFinished) {
            return <Redirect to={"/upload"} />
        }

        return <div ref={this.elementWrapper} style={{ display: "flex", height: "100%" }}>
            {this.isComponentLoading()
                ? <Spinner />
                : <div className={"vegaContainer"}>
                    {this.renderChartPerOperator()}
                </div>
            }
        </div>;
    }

    renderChartPerOperator() {
        const preparedData = this.prepareData();
        const domains = preparedData.domains;
        const dataFlattend = preparedData.dataFlattend;

        const dataFlattendFiltered = (curOp: string) => {
            const filteredData = dataFlattend.filter(elem => (elem.operator === curOp));
            return filteredData;
        }

        return this.props.operators!.map((elem, index) => (<Vega className={`vegaMemoryHeatmap-${elem}`} key={index} spec={this.createVisualizationSpec(elem, domains, dataFlattendFiltered(elem))} />));
    }

    prepareData() {
        const operatorArray = ((this.props.chartData[this.state.chartId] as model.ChartDataObject).chartData.data as model.IMemoryAccessHeatmapChart).operator;
        const bucketsArray = Array.from(((this.props.chartData[this.state.chartId] as model.ChartDataObject).chartData.data as model.IMemoryAccessHeatmapChart).buckets);
        const memoryAdressArray = Array.from(((this.props.chartData[this.state.chartId] as model.ChartDataObject).chartData.data as model.IMemoryAccessHeatmapChart).memoryAdress);
        const occurrencesArray = Array.from(((this.props.chartData[this.state.chartId] as model.ChartDataObject).chartData.data as model.IMemoryAccessHeatmapChart).occurrences);

        const dataFlattend: Array<{ operator: string, bucket: number, memAdr: number, occurrences: number }> = [];
        operatorArray.forEach((op, index) => {
            dataFlattend.push({
                operator: op,
                bucket: bucketsArray[index],
                memAdr: memoryAdressArray[index],
                occurrences: occurrencesArray[index],
            });
        }
        );

        const domains = {
            bucketDomain: [0, Math.max(...bucketsArray)],
            memDomain: [0, Math.max(...memoryAdressArray)],
            occurrencesDomain: [Math.min(...occurrencesArray), Math.max(...occurrencesArray)],
            // memDomain: [Math.min(...memoryAdressArray), Math.max(...memoryAdressArray)],
        }

        // const domains = {
        //     bucketDomain: bucketsArray,
        //     memDomain: memoryAdressArray,
        //     occurrencesDomain: occurrencesArray,
        // }

        return { dataFlattend, domains }
    }

    createVisualizationData(dataFlattendFiltered: any) {

        const occurrencesFlattend: Array<{ bucket: number, memAdr: number }> = [];
        dataFlattendFiltered.forEach((elem: { operator: string, bucket: number, memAdr: number, occurrences: number }) => {
            for (let i = 0; i < elem.occurrences; i++) {
                occurrencesFlattend.push({
                    bucket: elem.bucket,
                    memAdr: elem.memAdr,
                });
            }
        });

        const data = [
            {
                name: "table",
                values: occurrencesFlattend,
            },
            {
                name: "density",
                source: "table",
                transform: [
                    {
                        type: "kde2d",
                        size: [{ signal: "width" }, { signal: "height" }],
                        x: { "expr": "scale('x', datum.bucket)" },
                        y: { "expr": "scale('y', datum.memAdr)" },
                        bandwidth: {"signal": "[-1, -1]"},
                        as: "grid",
                    },
                    {
                        type: "heatmap",
                        field: "grid",
                        color: { "expr": "scale('density', datum.$value / datum.$max)" },
                        opacity: 1
                    }
                ]
            }
        ]
        return data;
    }

    createVisualizationSpec(operator: string, domains: any, dataFlattendFiltered: Array<any>) {
        const visData = this.createVisualizationData(dataFlattendFiltered);

        console.log(domains);
        console.log(visData);

        const spec: VisualizationSpec = {
            $schema: "https://vega.github.io/schema/vega/v5.json",
            width: 400,
            height: 300,
            padding: { left: 5, right: 5, top: 10, bottom: 10 },
            autosize: { type: "fit", resize: false },

            title: {
                text: `Memory Access Heatmap: ${operator}`,
                align: model.chartConfiguration.titleAlign,
                dy: model.chartConfiguration.titlePadding,
                fontSize: model.chartConfiguration.titleFontSize,
                font: model.chartConfiguration.titleFont,
            },

            // data: visData,
            data: visData,

            "scales": [
                {
                    "name": "x",
                    "type": "linear",
                    "domain": domains.bucketDomain,
                    "range": "width",
                    "zero": true,
                    "nice": true,
                    "round": true,
                },
                {
                    "name": "y",
                    "type": "linear",
                    "domain": domains.memDomain,
                    "range": "height",
                    "zero": true,
                    "nice": true,
                    "round": true,
                },
                {
                    "name": "density",
                    "type": "linear",
                    "range": { "scheme": "Viridis" },
                    "domain": [0, 1],
                    //  "domain": domains.occurrencesDomain,

                    "zero": true,
                }
            ],

            "axes": [
                {
                    "orient": "bottom",
                    "scale": "x",
                    labelOverlap: true,
                    //values: xTicks(),
                    title: model.chartConfiguration.memoryChartXTitle,
                    titlePadding: model.chartConfiguration.axisPadding,
                    labelFontSize: model.chartConfiguration.axisLabelFontSize,
                    titleFontSize: model.chartConfiguration.axisTitleFontSize,
                    titleFont: model.chartConfiguration.axisTitleFont,
                    labelFont: model.chartConfiguration.axisLabelFont,
                    labelSeparation: model.chartConfiguration.memoryChartXLabelSeparation,
                },
                {
                    orient: "left",
                    scale: "y",
                    zindex: 1,
                    title: model.chartConfiguration.memoryChartYTitle,
                    titlePadding: model.chartConfiguration.axisPadding,
                    labelFontSize: model.chartConfiguration.axisLabelFontSize,
                    labelSeparation: model.chartConfiguration.memoryChartYLabelSeparation,
                    labelOverlap: true,
                    titleFontSize: model.chartConfiguration.axisTitleFontSize,
                    titleFont: model.chartConfiguration.axisTitleFont,
                    labelFont: model.chartConfiguration.axisLabelFont,
                }
            ],

            "marks": [
                {
                    "type": "image",
                    "from": { "data": "density" },
                    "encode": {
                        "enter": {
                            // tooltip: {
                            //     signal: `{'Operator': '${operator}', ${model.chartConfiguration.memoryChartTooltip}}`,
                            // },
                        },
                        "update": {
                            "x": { "value": 0 },
                            "y": { "value": 0 },
                            "image": { "field": "image" },
                            "width": { "signal": "width" },
                            "height": { "signal": "height" },
                            "aspect": { "value": false },
                            "smooth": { "value": true }
                        }
                    }
                }
            ],

            "legends": [
                {
                    "fill": "density",
                    "type": "gradient",
                    "title": "Number of Accesses",
                    titleFontSize: model.chartConfiguration.legendTitleFontSize,
                    "titlePadding": 4,
                    "gradientLength": { "signal": "height - 20" }
                }
            ],
        } as VisualizationSpec;

        return spec;
    }



}

const mapStateToProps = (state: model.AppState) => ({
    resultLoading: state.resultLoading,
    result: state.result,
    csvParsingFinished: state.csvParsingFinished,
    currentChart: state.currentChart,
    currentEvent: state.currentEvent,
    events: state.events,
    chartIdCounter: state.chartIdCounter,
    chartData: state.chartData,
    currentPipeline: state.currentPipeline,
    currentOperator: state.currentOperator,
    operators: state.operators,
    currentTimeBucketSelectionTuple: state.currentTimeBucketSelectionTuple,
    currentBucketSize: state.currentBucketSize,

});

const mapDispatchToProps = (dispatch: model.Dispatch) => ({
    setCurrentChart: (newCurrentChart: string) => dispatch({
        type: model.StateMutationType.SET_CURRENTCHART,
        data: newCurrentChart,
    }),
    setChartIdCounter: (newChartIdCounter: number) => dispatch({
        type: model.StateMutationType.SET_CHARTIDCOUNTER,
        data: newChartIdCounter,
    }),
    setCurrentEvent: (newCurrentEvent: string) => dispatch({
        type: model.StateMutationType.SET_CURRENTEVENT,
        data: newCurrentEvent,
    })
});


export default connect(mapStateToProps, mapDispatchToProps)(Context.withAppContext(MemoryAccessHeatmapChart));




// //image version relative per ALL:
// import * as model from '../../model';
// import * as Controller from '../../controller/request_controller';
// import * as Context from '../../app_context';
// import Spinner from '../utils/spinner';
// import React from 'react';
// import { connect } from 'react-redux';
// import { SignalListeners, Vega } from 'react-vega';
// import { VisualizationSpec } from "react-vega/src";
// import { Redirect } from 'react-router-dom';
// import { createRef } from 'react';
// import _, { reverse } from "lodash";


// interface Props {
//     appContext: Context.IAppContext;
//     resultLoading: model.ResultLoading;
//     result: model.Result | undefined;
//     csvParsingFinished: boolean;
//     currentChart: string;
//     currentEvent: string;
//     events: Array<string> | undefined;
//     chartIdCounter: number;
//     chartData: model.ChartDataKeyValue,
//     currentPipeline: Array<string> | "All";
//     currentOperator: Array<string> | "All";
//     operators: Array<string> | undefined;
//     currentBucketSize: number,
//     currentTimeBucketSelectionTuple: [number, number],
//     setCurrentChart: (newCurrentChart: string) => void;
//     setChartIdCounter: (newChartIdCounter: number) => void;
//     setCurrentEvent: (newCurrentEvent: string) => void;
// }

// interface State {
//     chartId: number,
// }

// class MemoryAccessHeatmapChart extends React.Component<Props, State> {

//     elementWrapper = createRef<HTMLDivElement>();

//     constructor(props: Props) {
//         super(props);
//         this.state = {
//             chartId: this.props.chartIdCounter,
//         };
//         this.props.setChartIdCounter((this.state.chartId) + 1);

//         this.createVisualizationSpec = this.createVisualizationSpec.bind(this);
//     }

//     componentDidUpdate(prevProps: Props): void {
//         this.setDefaultEventToMemLoads(this.props, prevProps);
//         this.requestNewChartData(this.props, prevProps);
//     }

//     setDefaultEventToMemLoads(props: Props, prevProps: Props) {
//         console.log(prevProps.chartData[this.state.chartId]);
//         //only set bevore first time data requestes and if available memloads are in events and events available
//         if (props.events && props.events.includes("mem_inst_retired.all_loads") && !prevProps.chartData[this.state.chartId]) {
//             props.setCurrentEvent("mem_inst_retired.all_loads");
//         }
//     }

//     requestNewChartData(props: Props, prevProps: Props): void {
//         if (this.newChartDataNeeded(props, prevProps)) {
//             Controller.requestChartData(props.appContext.controller, this.state.chartId, model.ChartType.MEMORY_ACCESS_HEATMAP_CHART);
//         }
//     }

//     newChartDataNeeded(props: Props, prevProps: Props): boolean {
//         if (props.events &&
//             props.operators &&
//             (props.chartIdCounter !== prevProps.chartIdCounter ||
//                 props.currentBucketSize !== prevProps.currentBucketSize ||
//                 props.currentEvent !== prevProps.currentEvent ||
//                 !_.isEqual(props.operators, prevProps.operators) ||
//                 !_.isEqual(props.currentTimeBucketSelectionTuple, prevProps.currentTimeBucketSelectionTuple))) {
//             return true;
//         } else {
//             return false;
//         }
//     }

//     componentDidMount() {

//         if (this.props.csvParsingFinished) {
//             this.props.setCurrentChart(model.ChartType.MEMORY_ACCESS_HEATMAP_CHART);
//         }
//     }


//     isComponentLoading(): boolean {
//         if (this.props.resultLoading[this.state.chartId] || !this.props.chartData[this.state.chartId] || !this.props.operators) {
//             return true;
//         } else {
//             return false;
//         }
//     }

//     public render() {

//         if (!this.props.csvParsingFinished) {
//             return <Redirect to={"/upload"} />
//         }

//         return <div ref={this.elementWrapper} style={{ display: "flex", height: "100%" }}>
//             {this.isComponentLoading()
//                 ? <Spinner />
//                 : <div className={"vegaContainer"}>
//                     {<Vega className={`vegaMemoryHeatmap`} spec={this.createVisualizationSpec()} />}
//                 </div>
//             }
//         </div>;
//     }


//     createVisualizationData() {

//         const operatorArray = ((this.props.chartData[this.state.chartId] as model.ChartDataObject).chartData.data as model.IMemoryAccessHeatmapChart).operator;
//         const bucketsArray = Array.from(((this.props.chartData[this.state.chartId] as model.ChartDataObject).chartData.data as model.IMemoryAccessHeatmapChart).buckets);
//         const memoryAdressArray = Array.from(((this.props.chartData[this.state.chartId] as model.ChartDataObject).chartData.data as model.IMemoryAccessHeatmapChart).memoryAdress);
//         const occurrencesArray = Array.from(((this.props.chartData[this.state.chartId] as model.ChartDataObject).chartData.data as model.IMemoryAccessHeatmapChart).occurrences);

//         const dataFlattend: Array<{ operator: string, bucket: number, memAdr: number }> = [];
//         operatorArray.forEach((op, index) => {
//             for (let i = 0; i < occurrencesArray[index]; i++) {
//                 dataFlattend.push({
//                     operator: op,
//                     bucket: bucketsArray[index],
//                     memAdr: memoryAdressArray[index],
//                 });
//             }
//         }
//         );

//         const data = [
//             {
//                 name: "table",
//                 values: dataFlattend,
//             },
//             {
//                 name: "density",
//                 source: "table",
//                 transform: [
//                     {
//                         type: "kde2d",
//                         "groupby": ["operator"],
//                         size: [{ signal: "width" }, { signal: "height" }],
//                         x: { "expr": "scale('x', datum.bucket)" },
//                         y: { "expr": "scale('y', datum.memAdr)" },
//                         as: "grid",
//                         // "bandwidth": {"signal": "[bandwidthX, bandwidthY]"},
//                         // "cellSize": {"signal": "cellSize"},
//                         // "counts": {"signal": "counts"}
//                     },
//                     {
//                         type: "heatmap",
//                         field: "grid",
//                         color: { "expr": "scale('density', datum.$value / datum.$max)" },
//                         opacity: 1
//                     }
//                 ]
//             }
//         ]
//         return data;
//     }

//     createVisualizationSpec() {
//         const visData = this.createVisualizationData();


//         const spec: VisualizationSpec = {
//             $schema: "https://vega.github.io/schema/vega/v5.json",
//             width: 400,
//             height: 300,
//             padding: { left: 5, right: 5, top: 10, bottom: 10 },
//             autosize: { type: "fit", resize: false },

//             // title: {
//             //     text: `Memory Access Heatmap: ${operator}`,
//             //     align: model.chartConfiguration.titleAlign,
//             //     dy: model.chartConfiguration.titlePadding,
//             //     fontSize: model.chartConfiguration.titleFontSize,
//             //     font: model.chartConfiguration.titleFont,
//             // },

//             // data: visData,
//             data: visData,

//             "scales": [
//                 {
//                     "name": "x",
//                     "type": "linear",
//                     "domain": {
//                         data: "table",
//                         field: "bucket"
//                     },
//                     "range": "width",
//                     "zero": true,
//                     "nice": true,
//                     "round": true,
//                 },
//                 {
//                     "name": "y",
//                     "type": "linear",
//                     "domain": {
//                         data: "table",
//                         field: "memAdr"
//                     },
//                     "range": "height",
//                     "zero": true,
//                     "nice": true,
//                     "round": true,
//                 },
//                 {
//                     "name": "density",
//                     "type": "linear",
//                     "range": { "scheme": "Viridis" },
//                     "domain": [0, 1],
//                     //  "domain": domains.occurrencesDomain,
//                     "zero": true,
//                 }
//             ],

//             "axes": [
//                 {
//                     orient: "left",
//                     scale: "y",
//                     zindex: 1,
//                     title: model.chartConfiguration.memoryChartYTitle,
//                     titlePadding: model.chartConfiguration.axisPadding,
//                     labelFontSize: model.chartConfiguration.axisLabelFontSize,
//                     labelSeparation: model.chartConfiguration.memoryChartYLabelSeparation,
//                     labelOverlap: true,
//                     titleFontSize: model.chartConfiguration.axisTitleFontSize,
//                     titleFont: model.chartConfiguration.axisTitleFont,
//                     labelFont: model.chartConfiguration.axisLabelFont,
//                 }
//             ],

//             "legends": [
//                 {
//                     "fill": "density",
//                     "type": "gradient",
//                     "title": "Number of Accesses",
//                     titleFontSize: model.chartConfiguration.legendTitleFontSize,
//                     "titlePadding": 4,
//                     "gradientLength": { "signal": "height - 20" }
//                 }
//             ],

//             "layout": {
//                 "bounds": "flush",
//                 "columns": 3,
//                 "padding": 10,
//                 // align: "each",
//                 // center: true,
//             },

//             "marks": [
//                 {
//                     "type": "group",
//                     "from": {
//                         "facet": {
//                             "name": "facet",
//                             "data": "density",
//                             "groupby": "operator"
//                         }
//                     },

//                     "sort": { "field": "datum.operator", "order": "ascending" },

//                     "title": {
//                         //TODO 
//                         "text": { "signal": "parent.operator" },
//                         "frame": "group"
//                     },

//                     // title: {
//                     //     text: `Memory Access Heatmap: ${operator}`,
//                     //     align: model.chartConfiguration.titleAlign,
//                     //     dy: model.chartConfiguration.titlePadding,
//                     //     fontSize: model.chartConfiguration.titleFontSize,
//                     //     font: model.chartConfiguration.titleFont,
//                     // },

//                     "encode": {
//                         "update": {
//                             "width": { "signal": "width" },
//                             "height": { "signal": "height" }
//                         }
//                     },

//                     "axes": [
//                         {
//                             "scale": "x",
//                             "domain": false,
//                             "orient": "bottom",
//                             "tickCount": 5,
//                             "labelFlush": true,
//                         }
//                         // {
//                         //     "orient": "bottom",
//                         //     "scale": "x",
//                         //     labelOverlap: true,
//                         //     title: model.chartConfiguration.memoryChartXTitle,
//                         //     titlePadding: model.chartConfiguration.axisPadding,
//                         //     labelFontSize: model.chartConfiguration.axisLabelFontSize,
//                         //     titleFontSize: model.chartConfiguration.axisTitleFontSize,
//                         //     titleFont: model.chartConfiguration.axisTitleFont,
//                         //     labelFont: model.chartConfiguration.axisLabelFont,
//                         //     labelSeparation: model.chartConfiguration.memoryChartXLabelSeparation,
//                         // },
//                     ],

//                     "marks": [
//                         {
//                             "type": "image",
//                             "from": { "data": "facet" },
//                             "encode": {
//                                 "update": {
//                                     "x": { "value": 0 },
//                                     "y": { "value": 0 },
//                                     "image": { "field": "image" },
//                                     "width": { "signal": "width" },
//                                     "height": { "signal": "height" },
//                                     "aspect": { "value": false },
//                                 }
//                             }
//                         }
//                     ]
//                 }
//             ]
//         } as VisualizationSpec;

//         return spec;
//     }



// }

// const mapStateToProps = (state: model.AppState) => ({
//     resultLoading: state.resultLoading,
//     result: state.result,
//     csvParsingFinished: state.csvParsingFinished,
//     currentChart: state.currentChart,
//     currentEvent: state.currentEvent,
//     events: state.events,
//     chartIdCounter: state.chartIdCounter,
//     chartData: state.chartData,
//     currentPipeline: state.currentPipeline,
//     currentOperator: state.currentOperator,
//     operators: state.operators,
//     currentTimeBucketSelectionTuple: state.currentTimeBucketSelectionTuple,
//     currentBucketSize: state.currentBucketSize,

// });

// const mapDispatchToProps = (dispatch: model.Dispatch) => ({
//     setCurrentChart: (newCurrentChart: string) => dispatch({
//         type: model.StateMutationType.SET_CURRENTCHART,
//         data: newCurrentChart,
//     }),
//     setChartIdCounter: (newChartIdCounter: number) => dispatch({
//         type: model.StateMutationType.SET_CHARTIDCOUNTER,
//         data: newChartIdCounter,
//     }),
//     setCurrentEvent: (newCurrentEvent: string) => dispatch({
//         type: model.StateMutationType.SET_CURRENTEVENT,
//         data: newCurrentEvent,
//     })
// });


// export default connect(mapStateToProps, mapDispatchToProps)(Context.withAppContext(MemoryAccessHeatmapChart));

