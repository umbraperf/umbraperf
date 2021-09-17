import * as model from '../model';
import React from 'react';
import { Vega } from 'react-vega';
import { VisualizationSpec } from "react-vega/src";
import styles from '../style/charts.module.css';
import { Redirect } from 'react-router-dom';
import { createRef } from 'react';
import { connect } from 'react-redux';
import { ChartType } from '../controller/web_file_controller';
import PipelinesSelector from './utils/pipelines_selector';



interface Props {

    csvParsingFinished: boolean;
    setCurrentChart: (newCurrentChart: string) => void;

}

interface State {

}


class DonutChart extends React.Component<Props, State> {

    chartWrapper = createRef<HTMLDivElement>();

    constructor(props: Props) {
        super(props);
        this.state = {

        };

        this.createVisualizationSpec = this.createVisualizationSpec.bind(this);
    }

    componentDidUpdate(prevProps: Props): void {

    }


    componentDidMount() {
        if (this.props.csvParsingFinished) {
            this.props.setCurrentChart(ChartType.DONUT_CHART);

        }
    }


    public render() {

        if (!this.props.csvParsingFinished) {
            return <Redirect to={"/upload"} />
        }

        return <div>
            <div className={styles.resultArea} >

                <div className={"vegaContainer"} ref={this.chartWrapper}>
                    <Vega spec={this.createVisualizationSpec()} />
                </div>
                <div className={styles.optionsArea} >
                    <PipelinesSelector />
                </div>

            </div>

        </div>;
    }

    createVisualizationSpec() {

        const spec: VisualizationSpec = {
            $schema: "https://vega.github.io/schema/vega/v5.json",
            description: "A basic donut chart example.",
            width: 200,
            height: 200,
            autosize: "none",


            signals: [
                {
                    name: "startAngle", value: 0,
                    bind: { input: "range", min: 0, max: 6.29, step: 0.01 }
                },
                {
                    name: "endAngle", value: 6.29,
                    bind: { input: "range", min: 0, max: 6.29, step: 0.01 }
                },
                {
                    name: "padAngle", value: 0,
                    bind: { input: "range", min: 0, max: 0.1 }
                },
                {
                    name: "innerRadius", value: 60,
                    bind: { input: "range", min: 0, max: 90, step: 1 }
                },
                {
                    name: "cornerRadius", value: 0,
                    bind: { input: "range", min: 0, max: 10, step: 0.5 }
                },
                {
                    name: "sort", value: false,
                    bind: { input: "checkbox" }
                }
            ],

            data: [
                {
                    name: "table",
                    values: [
                        { id: 1, field: 4 },
                        { id: 2, field: 6 },
                        { id: 3, field: 10 },
                        { id: 4, field: 3 },
                        { id: 5, field: 7 },
                        { id: 6, field: 8 }
                    ],
                    transform: [
                        {
                            type: "pie",
                            field: "field",
                            startAngle: { signal: "startAngle" },
                            endAngle: { signal: "endAngle" },
                            sort: { signal: "sort" }
                        }
                    ]
                }
            ],

            scales: [
                {
                    name: "color",
                    type: "ordinal",
                    domain: { data: "table", field: "id" },
                    range: { scheme: "category20" }
                }
            ],

            marks: [
                {
                    type: "arc",
                    from: { data: "table" },
                    encode: {
                        enter: {
                            fill: { scale: "color", field: "id" },
                            x: { signal: "width / 2" },
                            y: { signal: "height / 2" }
                        },
                        update: {
                            startAngle: { field: "startAngle" },
                            endAngle: { field: "endAngle" },
                            padAngle: { signal: "padAngle" },
                            innerRadius: { signal: "innerRadius" },
                            outerRadius: { signal: "width / 2" },
                            cornerRadius: { signal: "cornerRadius" }
                        }
                    }
                }
            ]
        } as VisualizationSpec;
        return spec;
    }
}

const mapStateToProps = (state: model.AppState) => ({

    csvParsingFinished: state.csvParsingFinished,
});


const mapDispatchToProps = (dispatch: model.Dispatch) => ({
    setCurrentChart: (newCurrentChart: string) => dispatch({
        type: model.StateMutationType.SET_CURRENTCHART,
        data: newCurrentChart,
    }),
});


export default connect(mapStateToProps, mapDispatchToProps)(DonutChart);



