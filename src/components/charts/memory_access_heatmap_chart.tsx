import * as model from '../../model';
import * as Context from '../../app_context';
import React from 'react';
import { connect } from 'react-redux';
import { Vega } from 'react-vega';
import { VisualizationSpec } from "react-vega/src";
import _ from "lodash";


interface AppstateProps {
    appContext: Context.IAppContext;
    operators: Array<string> | undefined;
    chartData: model.IMemoryAccessHeatmapChartData,
}

type Props = AppstateProps & model.ISwimlanesProps

class MemoryAccessHeatmapChart extends React.Component<Props, {}> {

    constructor(props: Props) {
        super(props);

        // this.createVisualizationSpecAbsolute = this.createVisualizationSpecAbsolute.bind(this);
    }

    public render() {
        return <div>{this.renderChartPerOperator()}</div>
        // return <div> {this.renderChartPerOperatorRelative()}</div>
        /* {<Vega className={`vegaMemoryHeatmapAbsolute`} spec={this.createVisualizationSpecAbsolute()} />} */
    }

    renderChartPerOperator() {
        const vegaElements = this.props.chartData.heatmapsData.map((elem, index) => {
            const vegaElement = <Vega className={`vegaMemoryHeatmapRelative-${index}`} key={index} spec={this.createVisualizationSpec(index)} />
            return vegaElement;
        });
        return vegaElements;
    }
    // renderChartPerOperatorRelative() {
    //     const preparedData = this.flattenDataRelative();
    //     const domains = preparedData.domains;
    //     const dataFlattend = preparedData.dataFlattend;

    //     const dataFlattendFiltered = (curOp: string) => {
    //         const filteredData = dataFlattend.filter(elem => (elem.operator === curOp));
    //         return filteredData;
    //     }

    //     const specs = this.props.operators!.map((elem) => (this.createVisualizationSpecRelative(elem, domains, dataFlattendFiltered(elem))));
    //     const vegaElements: any = [];
    //     this.props.operators!.forEach((elem, index) => {
    //         if (specs[index]) {
    //             vegaElements.push(<Vega className={`vegaMemoryHeatmapRelative-${elem}`} key={index} spec={specs[index] as VisualizationSpec} />)
    //         }
    //     });

    //     return vegaElements;
    // }

    // flattenDataRelative() {
    //     const operatorArray = this.props.chartData.operator;
    //     const bucketsArray = Array.from(this.props.chartData.buckets);
    //     const memoryAdressArray = Array.from(this.props.chartData.memoryAdress);
    //     const occurrencesArray = Array.from(this.props.chartData.occurrences);

    //     const dataFlattend: Array<{ operator: string, bucket: number, memAdr: number, occurrences: number }> = [];
    //     operatorArray.forEach((op, index) => {
    //         dataFlattend.push({
    //             operator: op,
    //             bucket: bucketsArray[index],
    //             memAdr: memoryAdressArray[index],
    //             occurrences: occurrencesArray[index],
    //         });
    //     }
    //     );


    //     const domains = {
    //         bucketDomain: [_.min(bucketsArray), _.max(bucketsArray)],
    //         memDomain: [_.min(memoryAdressArray), _.max(memoryAdressArray)],
    //         //occurrencesDomain: [0, Math.max(...occurrencesArray)],
    //     }

    //     return { dataFlattend, domains }
    // }

    createVisualizationData(id: number) {

        const singleChartData = {
            //operator: this.props.chartData.heatmapsData[id].operator,
            bucket: Array.from(this.props.chartData.heatmapsData[id].buckets),
            memAdr: Array.from(this.props.chartData.heatmapsData[id].memoryAdress),
            occurrences: Array.from(this.props.chartData.heatmapsData[id].occurrences),
        }

        const data = [
            {
                name: "table",
                values: { bucket: singleChartData.bucket, memAdr: singleChartData.memAdr, occurrences: singleChartData.occurrences },
                transform: [
                    {
                        type: "flatten",
                        fields: ["bucket", "memAdr", "occurrences"]
                    },
                    {
                        type: "extent",
                        field: "occurrences",
                        signal: "extent"
                    }
                ]
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
                        bandwidth: { "signal": "[-1, -1]" },
                        as: "grid",
                    },
                    {
                        type: "heatmap",
                        field: "grid",
                        resolve: "shared",
                        color: { "expr": `scale('density', (datum.$value/datum.$max) * extent[1])` },
                        opacity: 1
                    }
                ]
            }
        ]
        return data;
    }

    createVisualizationSpec(id: number) {

        const visData = this.createVisualizationData(id);

        // if (visData[0].values && visData[0].values.length === 0) {
        //     //TODO still necessary? 
        //     return null;
        // };

        const spec: VisualizationSpec = {
            $schema: "https://vega.github.io/schema/vega/v5.json",
            width: 300,
            height: 200,
            padding: { left: 5, right: 5, top: 10, bottom: 10 },
            autosize: { type: "pad", resize: false },


            title: {
                //TODO change id to op name first element in data
                text: `Memory Access Heatmap: ${this.props.chartData.heatmapsData[id].operator[0]}`,
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
                    domain: [this.props.chartData.domain.timeDomain.min, this.props.chartData.domain.timeDomain.max],
                    domainMin: this.props.chartData.domain.timeDomain.min,
                    domainMax: this.props.chartData.domain.timeDomain.max,
                    "range": "width",
                    "zero": true,
                    "nice": true,
                    "round": true,
                },
                {
                    "name": "y",
                    "type": "linear",
                    domain: [this.props.chartData.domain.memoryDomain.min, this.props.chartData.domain.memoryDomain.max],
                    domainMin: this.props.chartData.domain.memoryDomain.min,
                    domainMax: this.props.chartData.domain.memoryDomain.max,
                    "range": "height",
                    "zero": true,
                    "nice": true,
                    "round": true,
                },
                {
                    "name": "density",
                    "type": "linear",
                    "range": { "scheme": "Viridis" },
                    "domain": [0, { "signal": "extent[1]" }],
                    // domain: [0, this.props.chartData.domain.frequencyDomain.max],
                    "zero": true,
                }
            ],

            "axes": [
                {
                    "orient": "bottom",
                    "scale": "x",
                    labelOverlap: true,
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
                            "image": [
                                { "test": "extent[1] > 0", "field": "image" },
                            ],
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
                    "gradientLength": { "signal": "height - 20" },
                    "labelOpacity": [
                        { "test": "extent[1] > 0", "value": 1 },
                        { "value": 0 }
                    ]
                }
            ],
        } as VisualizationSpec;

        return spec;
    }


    // createVisualizationDataAbsolute() {

    //     const operatorArray = this.props.chartData.operator;
    //     const bucketsArray = Array.from(this.props.chartData.buckets);
    //     const memoryAdressArray = Array.from(this.props.chartData.memoryAdress);
    //     const occurrencesArray = Array.from(this.props.chartData.occurrences);

    //     const dataFlattend: Array<{ operator: string, bucket: number, memAdr: number }> = [];
    //     operatorArray.forEach((op, index) => {
    //         dataFlattend.push({
    //             operator: op,
    //             bucket: bucketsArray[index],
    //             memAdr: memoryAdressArray[index],
    //         });
    //     }
    //     );

    //     const domains = {
    //         bucketDomain: [_.min(bucketsArray), _.max(bucketsArray)],
    //         memDomain: [_.min(memoryAdressArray), _.max(memoryAdressArray)],
    //         occurrencesDomain: [_.min(occurrencesArray), _.max(occurrencesArray)],
    //     }

    //     const data = [
    //         {
    //             name: "table",
    //             values: dataFlattend,
    //         },
    //         {
    //             name: "density",
    //             source: "table",
    //             transform: [
    //                 {
    //                     type: "kde2d",
    //                     groupby: ["operator"],
    //                     size: [{ signal: "width" }, { signal: "height" }],
    //                     x: { "expr": "scale('x', datum.bucket)" },
    //                     y: { "expr": "scale('y', datum.memAdr)" },
    //                     bandwidth: { "signal": "[-1, -1]" },
    //                     as: "grid",
    //                 },
    //                 {
    //                     type: "heatmap",
    //                     field: "grid",
    //                     resolve: "shared",
    //                     color: { "expr": `scale('density', (datum.$value/datum.$max)*${domains.occurrencesDomain[1]})` },
    //                     opacity: 1
    //                 }
    //             ]
    //         }
    //     ]
    //     return { data, domains };
    // }

    // createVisualizationSpecAbsolute() {
    //     const visData = this.createVisualizationDataAbsolute();

    //     const getColumns = () => {
    //         if (this.props.width < 800) {
    //             return 1;
    //         } else if (this.props.width < 1200) {
    //             return 2;
    //         } else if (this.props.width < 1520) {
    //             return 3;
    //         } else {
    //             return 4;
    //         }
    //     }

    //     const spec: VisualizationSpec = {
    //         $schema: "https://vega.github.io/schema/vega/v5.json",
    //         width: 300,
    //         height: 200,
    //         padding: { left: 5, right: 5, top: 10, bottom: 10 },
    //         autosize: { type: "pad", resize: false },

    //         layout: {

    //             padding: 20,
    //             columns: getColumns(),
    //             align: "all",
    //             bounds: "full",
    //             center: { "row": true, "column": true },
    //         },

    //         title: {
    //             text: `Memory Access Heatmap (Absolute)`,
    //             align: model.chartConfiguration.titleAlign,
    //             dy: model.chartConfiguration.titlePadding,
    //             fontSize: model.chartConfiguration.titleFontSize,
    //             font: model.chartConfiguration.titleFont,
    //         },

    //         // data: visData,
    //         data: visData.data,

    //         "scales": [
    //             {
    //                 "name": "x",
    //                 "type": "linear",
    //                 "domain": visData.domains.bucketDomain,
    //                 domainMin: visData.domains.bucketDomain[0],
    //                 domainMax: visData.domains.bucketDomain[1],
    //                 "range": "width",
    //                 "zero": true,
    //                 "nice": true,
    //                 "round": true,
    //             },
    //             {
    //                 "name": "y",
    //                 "type": "linear",
    //                 "domain": visData.domains.memDomain,
    //                 domainMin: visData.domains.memDomain[0],
    //                 domainMax: visData.domains.memDomain[1],
    //                 "range": "height",
    //                 "zero": true,
    //                 "nice": true,
    //                 "round": true,
    //             },
    //             {
    //                 "name": "density",
    //                 "type": "linear",
    //                 "range": { "scheme": "Viridis" },
    //                 "domain": visData.domains.occurrencesDomain,
    //                 "zero": true,
    //             }
    //         ],

    //         "marks": [
    //             {
    //                 "type": "group",
    //                 "from": {
    //                     "facet": {
    //                         "name": "facet",
    //                         "data": "density",
    //                         "groupby": "operator"
    //                     }
    //                 },

    //                 //"sort": { "field": "datum.Origin", "order": "ascending" },

    //                 "title": {
    //                     "text": { "signal": "parent.operator" },
    //                     "frame": "group",
    //                     fontSize: model.chartConfiguration.titleFontSize,
    //                     font: model.chartConfiguration.titleFont,
    //                 },

    //                 "encode": {
    //                     "update": {
    //                         "width": { "signal": "width" },
    //                         "height": { "signal": "height" }
    //                     }
    //                 },

    //                 "axes": [
    //                     {
    //                         "orient": "bottom",
    //                         "scale": "x",
    //                         labelOverlap: true,
    //                         //values: xTicks(),
    //                         title: model.chartConfiguration.memoryChartXTitle,
    //                         titlePadding: model.chartConfiguration.axisPadding,
    //                         labelFontSize: model.chartConfiguration.axisLabelFontSize,
    //                         titleFontSize: model.chartConfiguration.axisTitleFontSize,
    //                         titleFont: model.chartConfiguration.axisTitleFont,
    //                         labelFont: model.chartConfiguration.axisLabelFont,
    //                         labelSeparation: model.chartConfiguration.memoryChartXLabelSeparation,
    //                     },
    //                     {
    //                         orient: "left",
    //                         scale: "y",
    //                         zindex: 1,
    //                         title: model.chartConfiguration.memoryChartYTitle,
    //                         titlePadding: model.chartConfiguration.axisPadding,
    //                         labelFontSize: model.chartConfiguration.axisLabelFontSize,
    //                         labelSeparation: model.chartConfiguration.memoryChartYLabelSeparation,
    //                         labelOverlap: true,
    //                         titleFontSize: model.chartConfiguration.axisTitleFontSize,
    //                         titleFont: model.chartConfiguration.axisTitleFont,
    //                         labelFont: model.chartConfiguration.axisLabelFont,
    //                     }
    //                 ],

    //                 "marks": [
    //                     {
    //                         "type": "image",
    //                         "from": { "data": "facet" },
    //                         "encode": {
    //                             "enter": {
    //                                 // tooltip: {
    //                                 //     signal: `{'Operator': '${operator}', ${model.chartConfiguration.memoryChartTooltip}}`,
    //                                 // },
    //                             },
    //                             "update": {
    //                                 "x": { "value": 0 },
    //                                 "y": { "value": 0 },
    //                                 "image": { "field": "image" },
    //                                 "width": { "signal": "width" },
    //                                 "height": { "signal": "height" },
    //                                 "aspect": { "value": false },
    //                                 "smooth": { "value": true }
    //                             }
    //                         }
    //                     }
    //                 ],
    //                 "legends": [
    //                     {
    //                         "fill": "density",
    //                         "type": "gradient",
    //                         "title": "# Accesses",
    //                         titleFontSize: model.chartConfiguration.legendTitleFontSize,
    //                         "titlePadding": 4,
    //                         "gradientLength": { "signal": "height - 20" },
    //                         direction: "vertical",
    //                         orient: "right",
    //                     }
    //                 ],
    //             }
    //         ],

    //     } as VisualizationSpec;

    //     return spec;
    // }

}

const mapStateToProps = (state: model.AppState, ownProps: model.IMemoryAccessHeatmapChartProps) => ({
    operators: state.operators,
    chartData: state.chartData[ownProps.chartId].chartData.data as model.IMemoryAccessHeatmapChartData,
});


export default connect(mapStateToProps, undefined)(Context.withAppContext(MemoryAccessHeatmapChart));

