import * as model from '../../../model';
import * as Context from '../../../app_context';
import styles from '../../../style/charts.module.css';
import React from 'react';
import { connect } from 'react-redux';
import { Vega } from 'react-vega';
import { VisualizationSpec } from "react-vega/src";
import _ from 'lodash';
import HeatmapsDiffToggler from '../../utils/heatmaps_difference_toggler';


interface AppstateProps {
    appContext: Context.IAppContext;
    operators: Array<string> | undefined;
    chartData: model.IMemoryAccessHeatmapChartData,
    memoryHeatmapsDifferenceRepresentation: boolean,
}

type Props = AppstateProps & model.ISwimlanesProps

class MemoryAccessHeatmapChart extends React.Component<Props, {}> {

    constructor(props: Props) {
        super(props);
    }

    public render() {
        return <div
            className={styles.vegaHeatmapsContainer}
        >
            <div className={styles.vegaHeatmapsTogglerArea}>
                <HeatmapsDiffToggler />
            </div>

            <div className={styles.vegaHeatmapsArea}>
                {this.renderChartPerOperator()}
            </div>

        </div>
    }

    renderChartPerOperator() {
        let vegaElements = new Array<JSX.Element>();
        this.props.chartData.heatmapsData.forEach((elem, index) => {
            if (elem.operator.length > 0) {
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

        const yDomain = () => {
            if (this.props.memoryHeatmapsDifferenceRepresentation) {
                return {
                    data: "table",
                    field: "memAdr",
                };
            } else {
                return [this.props.chartData.domain.memoryDomain.min, this.props.chartData.domain.memoryDomain.max];
            }
        };

        const spec: VisualizationSpec = {
            $schema: "https://vega.github.io/schema/vega/v5.json",
            width: 300,
            height: 200,
            padding: { left: 5, right: 5, top: 10, bottom: 10 },
            autosize: { type: "pad", resize: false },


            title: {
                text: `Memory Access Heatmap${this.props.memoryHeatmapsDifferenceRepresentation ? " (Differences)" : ""}: ${this.props.chartData.heatmapsData[id].operator[0]}`,
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
                    domain: yDomain(),
                    domainMin: this.props.memoryHeatmapsDifferenceRepresentation ? null : this.props.chartData.domain.memoryDomain.min,
                    domainMax: this.props.memoryHeatmapsDifferenceRepresentation ? null : this.props.chartData.domain.memoryDomain.max,
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

}

const mapStateToProps = (state: model.AppState, ownProps: model.IMemoryAccessHeatmapChartProps) => ({
    operators: state.operators,
    chartData: state.chartData[ownProps.chartId].chartData.data as model.IMemoryAccessHeatmapChartData,
    memoryHeatmapsDifferenceRepresentation: state.memoryHeatmapsDifferenceRepresentation,
});


export default connect(mapStateToProps, undefined)(Context.withAppContext(MemoryAccessHeatmapChart));

