import * as model from '../../model';
import React from 'react';
import { connect } from 'react-redux';
import { IAppContext, withAppContext } from '../../app_context';
import { Vega } from 'react-vega';
import { Result } from 'src/model/core_result';
import { VisualizationSpec } from "../../../node_modules/react-vega/src";
import styles from '../../style/charts.module.css';
import { Redirect } from 'react-router-dom';
import { createRef } from 'react';


interface Props {
    appContext: IAppContext;
    resultLoading: boolean;
    result: Result | undefined;
}

interface State {
    width: number,
    height: number,
}

class SwimLanes extends React.Component<Props, State> {

    chartWrapper = createRef<HTMLDivElement>();

    constructor(props: Props) {
        super(props);
        this.state = {
            width: 1000,
            height: 500,
        };

        this.createVisualizationSpec = this.createVisualizationSpec.bind(this);
    }

    componentDidUpdate(prevProps: Props): void {
        if (prevProps.result != this.props.result && undefined != this.props.result && !this.props.resultLoading) {
            //TODO
        }
    }

    componentDidMount() {
        addEventListener('resize', (event) => {
            this.resizeListener();
        });
    }

    componentWillUnmount() {
        removeEventListener('resize', (event) => {
            this.resizeListener();
        });
    }

    resizeListener() {
        if (!this.chartWrapper) return;

        const child = this.chartWrapper.current;
        if (child) {
            const newWidth = child.clientWidth;

            child.style.display = 'none';

            this.setState((state, props) => ({
                ...state,
                width: newWidth,
            }));

            child.style.display = 'block';
        }


    }


    public render() {
        if (!this.props.result) {
            return <Redirect to={"/upload"} />
        }

        return <div>
            <div className={styles.resultArea} >
                <div className={"vegaContainer"} ref={this.chartWrapper}>
                    <Vega spec={this.createVisualizationSpec()} />
                </div>
            </div>
            <div>
                <p>Result of computation from rust is: {this.props.result?.test}</p>
            </div>
        </div>;
    }

    createVisualizationData() {
        const data = {
            "name": "table",
            "values": [
                { "x": 0, "y": 28, "c": 0 }, { "x": 0, "y": 55, "c": 1 },
                { "x": 1, "y": 43, "c": 0 }, { "x": 1, "y": 91, "c": 1 },
                { "x": 2, "y": 81, "c": 0 }, { "x": 2, "y": 53, "c": 1 },
                { "x": 3, "y": 19, "c": 0 }, { "x": 3, "y": 87, "c": 1 },
                { "x": 4, "y": 52, "c": 0 }, { "x": 4, "y": 48, "c": 1 },
                { "x": 5, "y": 24, "c": 0 }, { "x": 5, "y": 49, "c": 1 },
                { "x": 6, "y": 87, "c": 0 }, { "x": 6, "y": 66, "c": 1 },
                { "x": 7, "y": 17, "c": 0 }, { "x": 7, "y": 27, "c": 1 },
                { "x": 8, "y": 68, "c": 0 }, { "x": 8, "y": 16, "c": 1 },
                { "x": 9, "y": 49, "c": 0 }, { "x": 9, "y": 15, "c": 1 }
            ],
            "transform": [
                {
                    "type": "stack",
                    "groupby": ["x"],
                    "sort": { "field": "c" },
                    "field": "y"
                }
            ]
        };

        return data;
    }

    createVisualizationSpec() {
        const visData = this.createVisualizationData();

        const spec: VisualizationSpec = {
            $schema: "https://vega.github.io/schema/vega/v5.json",
            width: this.state.width,
            height: this.state.height,
            padding: { left: 5, right: 5, top: 5, bottom: 5 },
            resize: true,
            autosize: 'fit',

            data: [
                visData
            ],

            scales: [
                {
                    name: "x",
                    type: "point",
                    range: "width",
                    domain: {
                        data: "table",
                        field: "x"
                    }
                },
                {
                    name: "y",
                    type: "linear",
                    range: "height",
                    nice: true,
                    zero: true,
                    domain: {
                        data: "table",
                        field: "y1"
                    }
                },
                {
                    name: "color",
                    type: "ordinal",
                    range: "category",
                    domain: {
                        data: "table",
                        field: "c"
                    }
                }
            ],
            axes: [
                {
                    orient: "bottom",
                    scale: "x",
                    zindex: 1
                },
                {
                    orient: "left",
                    scale: "y",
                    zindex: 1
                }
            ],
            marks: [
                {
                    type: "group",
                    from: {
                        facet: {
                            name: "series",
                            data: "table",
                            groupby: "c"
                        }
                    },
                    marks: [
                        {
                            type: "area",
                            from: {
                                data: "series"
                            },
                            encode: {
                                enter: {
                                    interpolate: {
                                        value: "monotone"
                                    },
                                    x: {
                                        scale: "x",
                                        field: "x"
                                    },
                                    y: {
                                        scale: "y",
                                        field: "y0"
                                    },
                                    y2: {
                                        scale: "y",
                                        field: "y1"
                                    },
                                    fill: {
                                        scale: "color",
                                        field: "c"
                                    }
                                },
                                update: {
                                    fillOpacity: {
                                        value: 1
                                    }
                                },
                                hover: {
                                    fillOpacity: {
                                        value: 0.5
                                    }
                                }
                            }
                        }
                    ]
                }
            ]
        } as VisualizationSpec;

        return spec;
    }

}

const mapStateToProps = (state: model.AppState) => ({
    resultLoading: state.resultLoading,
    result: state.result,
});


export default connect(mapStateToProps)(withAppContext(SwimLanes));



