import * as model from '../../model';
import React from 'react';
import { IAppContext, withAppContext } from '../../app_context';
import { Vega } from 'react-vega';
import { Result } from 'src/model/core_result';
import { VisualizationSpec } from "react-vega/src";
import styles from '../../style/charts.module.css';
import { Redirect } from 'react-router-dom';
import { createRef } from 'react';
import { connect } from 'react-redux';
import { ChartType, requestChartData } from '../../controller/web_file_controller';
import { CircularProgress } from '@material-ui/core';
import EventsButtons from '../utils/events_buttons';
import * as RestApi from '../../model/rest_queries';
import _ from "lodash";



interface Props {
    appContext: IAppContext;
    resultLoading: boolean;
    result: Result | undefined;
    csvParsingFinished: boolean;
    currentChart: string;
    currentEvent: string;
    currentRequest: RestApi.RestQueryType | undefined;
    events: Array<string> | undefined;
    chartIdCounter: number;
    chartData: model.ChartDataKeyValue,
    multipleChartDataLength: number;
    setCurrentChart: (newCurrentChart: string) => void;
    setCurrentEvent: (newCurrentEvent: string) => void;
    setChartIdCounter: (newChartIdCounter: number) => void;

}

interface State {
    chartId: number,
    width: number,
    height: number
}

interface IChartData {
    buckets: Array<number>,
    operators: Array<string>,
    relativeFrquencies: Array<number>,
}

const startSize = {
    width: 750,
    height: 200,
}

class DonutChart extends React.Component<Props, State> {

    chartWrapper = createRef<HTMLDivElement>();

    constructor(props: Props) {
        super(props);
        this.state = {
            chartId: this.props.chartIdCounter,
            width: startSize.width,
            height: startSize.height,
        };
        this.props.setChartIdCounter(this.state.chartId + 1);

        this.createVisualizationSpec = this.createVisualizationSpec.bind(this);
    }

    componentDidUpdate(prevProps: Props): void {

        //if current event changes, component did update is executed and queries new data for new event
        if (this.props.currentEvent != prevProps.currentEvent) {
            // requestChartData(this.props.appContext.controller, this.state.chartId, ChartType.DONUT_CHART);
        }

    }


    componentDidMount() {
        if (this.props.csvParsingFinished) {
            this.props.setCurrentChart(ChartType.DONUT_CHART);

           /*  if (!this.props.events) {
                requestEvents(this.props.appContext.controller);
            } else {
                this.props.setCurrentEvent(this.props.events[0]);
            } */

            addEventListener('resize', (event) => {
                this.resizeListener();
            });
        }
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
            const newHeight = child.clientHeight;

            child.style.display = 'none';

            this.setState((state, props) => ({
                ...state,
                width: newWidth > startSize.width ? startSize.width : newWidth,
                height: newHeight > startSize.height ? startSize.height : newHeight,
            }));

            child.style.display = 'block';
        }
    }


    public render() {

        if (!this.props.csvParsingFinished) {
            return <Redirect to={"/upload"} />
        }

        if (!this.props.events) {
            return <div className={styles.spinnerArea} >
                <CircularProgress />
            </div>
        }

        return <div>
            {this.props.events &&
                <div className={styles.resultArea} >
                    <div className={styles.optionsArea} >
                        <EventsButtons></EventsButtons>
                    </div>
                    <div className={"vegaContainer"} ref={this.chartWrapper}>
                            <Vega spec={this.createVisualizationSpec()} />
                        </div>
                   {/*  {(this.props.resultLoading || !this.props.chartData[this.state.chartId])
                        ? <CircularProgress />
                        : <div className={"vegaContainer"} ref={this.chartWrapper}>
                            <Vega spec={this.createVisualizationSpec()} />
                        </div>
                    } */}

                </div>
            }
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
      bind: {input: "range", min: 0, max: 6.29, step: 0.01}
    },
    {
      name: "endAngle", value: 6.29,
      bind: {input: "range", min: 0, max: 6.29, step: 0.01}
    },
    {
      name: "padAngle", value: 0,
      bind: {input: "range", min: 0, max: 0.1}
    },
    {
      name: "innerRadius", value: 60,
      bind: {input: "range", min: 0, max: 90, step: 1}
    },
    {
      name: "cornerRadius", value: 0,
      bind: {input: "range", min: 0, max: 10, step: 0.5}
    },
    {
      name: "sort", value: false,
      bind: {input: "checkbox"}
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
    resultLoading: state.resultLoading,
    result: state.result,
    csvParsingFinished: state.csvParsingFinished,
    currentChart: state.currentChart,
    currentEvent: state.currentEvent,
    currentRequest: state.currentRequest,
    events: state.events,
    chartIdCounter: state.chartIdCounter,
    chartData: state.chartData,
});


const mapDispatchToProps = (dispatch: model.Dispatch) => ({
    setCurrentChart: (newCurrentChart: string) => dispatch({
        type: model.StateMutationType.SET_CURRENTCHART,
        data: newCurrentChart,
    }),
    setCurrentEvent: (newCurrentEvent: string) => dispatch({
        type: model.StateMutationType.SET_CURRENTEVENT,
        data: newCurrentEvent,
    }),
    setChartIdCounter: (newChartIdCounter: number) => dispatch({
        type: model.StateMutationType.SET_CHARTIDCOUNTER,
        data: newChartIdCounter,
    }),
});


export default connect(mapStateToProps, mapDispatchToProps)(withAppContext(DonutChart));



