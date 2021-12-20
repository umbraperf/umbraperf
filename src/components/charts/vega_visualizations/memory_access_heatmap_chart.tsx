import * as model from '../../../model';
import * as Controller from '../../../controller';
import * as Context from '../../../app_context';
import styles from '../../../style/charts.module.css';
import HeatmapsMemoryAddressSelector from '../../utils/togglers/heatmaps_memory_address_slider';
import React from 'react';
import { connect } from 'react-redux';
import { Vega } from 'react-vega';
import { VisualizationSpec } from "react-vega/src";
import _ from 'lodash';

interface AppstateProps {
    appContext: Context.IAppContext;
    chartData: model.IMemoryAccessHeatmapChartData,
    memoryHeatmapsDifferenceRepresentation: boolean,
    operators: model.IOperatorsData | undefined;
}

type Props = AppstateProps & model.ISwimlanesProps

class MemoryAccessHeatmapChart extends React.Component<Props, {}> {

    constructor(props: Props) {
        super(props);
    }

    public render() {
        return <div className={styles.vegaHeatmapsContainer}>
            <HeatmapsMemoryAddressSelector memoryAddressDomain={[this.props.chartData.domain.memoryDomain.min, this.props.chartData.domain.memoryDomain.max]} />
            <div className={styles.vegaHeatmaps}>
                {this.renderChartPerOperator()}
            </div>
        </div>
    }

    renderChartPerOperator() {
        let vegaElements = new Array<JSX.Element>();
        this.props.chartData.heatmapsData.forEach((elem, index) => {
            if (elem.operator.length > 0 && !(elem.operator.length === 1 && elem.buckets[0] === -1)) {
                const vegaElement = <Vega className={`vegaMemoryHeatmapRelative-${index}`} key={index} spec={this.createVisualizationSpec(index)} />
                vegaElements.push(vegaElement);
            }
        });
        return vegaElements;
    }

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
                        signal: "extentOccurrences"
                    },
                    {
                        type: "extent",
                        field: "memAdr",
                        signal: "extentMemAdr"
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
                        bandwidth: { "signal": "[5, 5]" },
                        // bandwidth: { "signal": "[-1, -1]" },
                        as: "grid",
                    },
                    {
                        type: "heatmap",
                        field: "grid",
                        resolve: "shared",
                        color: { "expr": `scale('density', (datum.$value/datum.$max) * extentOccurrences[1])` },
                        opacity: 1
                    }
                ]
            }
        ]
        return data;
    }

    createVisualizationSpec(id: number) {

        const visData = this.createVisualizationData(id);

        const yDomain = (): { domain: any, domainMax?: object, domainMin?: object } => {
            if (this.props.memoryHeatmapsDifferenceRepresentation) {
                return {
                    domain: [
                        { signal: "((abs(extentMemAdr[0]) > abs(extentMemAdr[1]) || (extentMemAdr[0] == extentMemAdr[1] && extentMemAdr[0] <= 0))) ? extentMemAdr[0] : -extentMemAdr[1]" },
                        { signal: "((abs(extentMemAdr[0]) > abs(extentMemAdr[1]) || (extentMemAdr[0] == extentMemAdr[1] && extentMemAdr[0] <= 0))) ? abs(extentMemAdr[0]) : extentMemAdr[1]" }
                    ],
                    domainMax: undefined,
                    domainMin: undefined,
                };
            } else {
                return {
                    domain: {
                        data: "table",
                        field: "memAdr",
                    },
                    domainMin: { signal: "extentMemAdr[0]" }
                };
            }
        };

        const isSmallWindow = this.props.width < 500;

        const createHeatmapTitle = () => {
            const titlePrefix = "Memory Access Heatmap"
            const operatorId = this.props.chartData.heatmapsData[id].operator[0];
            const operatorNice = this.props.operators!.operatorsNice[this.props.operators!.operatorsId.indexOf(operatorId)];
            let title = `: ${operatorId}`;
            if (operatorNice !== "-") {
                title = title + ` (${operatorNice})`;
            }
            if (this.props.memoryHeatmapsDifferenceRepresentation) {
                title = " (Differences)" + title;
            }
            title = titlePrefix + title;
            return title;
        }

        const spec: VisualizationSpec = {
            $schema: "https://vega.github.io/schema/vega/v5.json",
            width: isSmallWindow ? 150 : 300,
            height: isSmallWindow ? 100 : 200,
            padding: { left: 5, right: 5, top: 10, bottom: 10 },
            autosize: { type: "pad", resize: false },

            title: {
                text: createHeatmapTitle(),
                align: model.chartConfiguration.titleAlign,
                dy: model.chartConfiguration.titlePadding,
                fontSize: model.chartConfiguration.titleFontSize,
                font: model.chartConfiguration.titleFont,
            },

            data: visData,

            scales: [
                {
                    name: "x",
                    type: "linear",
                    domain: [this.props.chartData.domain.timeDomain.min, this.props.chartData.domain.timeDomain.max],
                    domainMin: this.props.chartData.domain.timeDomain.min,
                    domainMax: this.props.chartData.domain.timeDomain.max,
                    range: "width",
                    zero: true,
                    nice: true,
                    round: true,
                },
                {
                    name: "y",
                    type: "linear",
                    domain: yDomain().domain,
                    domainMax: yDomain().domainMax,
                    domainMin: yDomain().domainMin,
                    range: "height",
                    zero: true,
                    nice: true,
                    round: true,
                },
                {
                    name: "density",
                    type: "linear",
                    range: { scheme: "Viridis" },
                    domain: [0, { signal: "extentOccurrences[1]" }],
                    zero: true,
                }
            ],

            axes: [
                {
                    orient: "bottom",
                    scale: "x",
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

            marks: [
                {
                    type: "image",
                    from: { "data": "density" },
                    encode: {
                        update: {
                            x: { value: 0 },
                            y: { value: 0 },
                            image: [
                                { test: "extentOccurrences[1] > 0", field: "image" },
                            ],
                            width: { signal: "width" },
                            height: { signal: "height" },
                            aspect: { value: false },
                            smooth: { value: true }
                        }
                    }
                }
            ],

            legends: [
                {
                    fill: "density",
                    type: "gradient",
                    title: "Number of Accesses",
                    titleFontSize: model.chartConfiguration.legendTitleFontSize,
                    titlePadding: 4,
                    gradientLength: { signal: "height - 20" },
                    labelOpacity: [
                        { test: "extentOccurrences[1] > 0", value: 1 },
                        { value: 0 }
                    ]
                }
            ],
        } as VisualizationSpec;

        return spec;
    }

}

const mapStateToProps = (state: model.AppState, ownProps: model.IMemoryAccessHeatmapChartProps) => ({
    chartData: state.chartData[ownProps.chartId].chartData.data as model.IMemoryAccessHeatmapChartData,
    memoryHeatmapsDifferenceRepresentation: state.memoryHeatmapsDifferenceRepresentation,
    operators: state.operators,
});


export default connect(mapStateToProps, undefined)(Context.withAppContext(MemoryAccessHeatmapChart));

