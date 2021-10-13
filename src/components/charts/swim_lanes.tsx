import * as model from '../../model';
import * as Controller from '../../controller/request_controller';
import * as Context from '../../app_context';
import Spinner from '../utils/spinner';
import React from 'react';
import { connect } from 'react-redux';
import { Vega } from 'react-vega';
import { VisualizationSpec } from "../../../node_modules/react-vega/src";
import { Redirect } from 'react-router-dom';
import { createRef } from 'react';


interface Props {
   appContext: Context.IAppContext;
   resultLoading: model.ResultLoading;
   result: model.Result | undefined;
   csvParsingFinished: boolean;
   currentChart: string;
   currentEvent: string;
   currentRequest: model.RestQueryType | undefined;
   events: Array<string> | undefined;
   operators: Array<string> | undefined;
   chartIdCounter: number;
   chartData: model.ChartDataKeyValue,
   currentInterpolation: String,
   currentBucketSize: number,
   setCurrentChart: (newCurrentChart: string) => void;
   setChartIdCounter: (newChartIdCounter: number) => void;

}

interface State {
   chartId: number,
   width: number,
   height: number,
}

const startSize = {
   width: 750,
   height: 200,
}

class SwimLanes extends React.Component<Props, State> {

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

   componentDidUpdate(prevProps: Props, prevState: State): void {

      this.requestNewChartData(this.props, prevProps);

   }

   requestNewChartData(props: Props, prevProps: Props): void {
      if (this.newChartDataNeeded(props, prevProps)) {
         Controller.requestChartData(props.appContext.controller, this.state.chartId, model.ChartType.SWIM_LANES);
      }
   }

   newChartDataNeeded(props: Props, prevProps: Props): boolean {
      if (prevProps.currentEvent !== "Default" &&
         (props.currentEvent !== prevProps.currentEvent ||
            props.operators !== prevProps.operators ||
            props.currentBucketSize !== prevProps.currentBucketSize ||
            props.chartIdCounter !== prevProps.chartIdCounter)) {
         return true;
      } else {
         return false;
      }
   }


   componentDidMount() {
      if (this.props.csvParsingFinished) {
         this.props.setCurrentChart(model.ChartType.SWIM_LANES);

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
            //height: newHeight,
         }));

         child.style.display = 'block';
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

      return <div>
         {this.isComponentLoading()
            ? <Spinner />
            : <div className={"vegaContainer"} ref={this.chartWrapper}>
               <Vega className={`vegaSwimlaneTotal}`} spec={this.createVisualizationSpec()} />
            </div>
         }
      </div>;
   }

   createVisualizationData() {

      const chartDataElement: model.ISwimlanesData = {
         buckets: ((this.props.chartData[this.state.chartId] as model.ChartDataObject).chartData.data as model.ISwimlanesData).buckets,
         operators: ((this.props.chartData[this.state.chartId] as model.ChartDataObject).chartData.data as model.ISwimlanesData).operators,
         frequency: ((this.props.chartData[this.state.chartId] as model.ChartDataObject).chartData.data as model.ISwimlanesData).frequency,
      }

      const data = {
         "name": "table",
         "values": chartDataElement,
         transform: [
            { "type": "flatten", "fields": ["buckets", "operators", "frequency"] },
            { "type": "collect", "sort": { "field": "operators" } },
            { "type": "stack", "groupby": ["buckets"], "field": "frequency" }
         ]
      };

      return { data: data, chartDataElement: chartDataElement };
   }

   createVisualizationSpec() {
      const visData = this.createVisualizationData();

      const xTicks = () => {

         const bucketsArrayLength = visData.chartDataElement.buckets.length;
         const numberOfTicks = 20;

         if (bucketsArrayLength > numberOfTicks) {

            let ticks = [];

            const delta = Math.floor(bucketsArrayLength / numberOfTicks);

            for (let i = 0; i < bucketsArrayLength; i = i + delta) {
               ticks.push(visData.chartDataElement.buckets[i]);
            }
            return ticks;
         }

      }

      const spec: VisualizationSpec = {
         $schema: "https://vega.github.io/schema/vega/v5.json",
         width: this.state.width,
         height: this.state.height,
         padding: { left: 10, right: 10, top: 20, bottom: 20 },
         resize: true,
         autosize: 'fit',

         title: {
            text: 'Swim Lanes (all Pipelines)',
            align: model.chartConfiguration.titleAlign,
            dy: model.chartConfiguration.titlePadding,
            font: model.chartConfiguration.titleFont
         },

         data: [
            visData.data
         ],

         scales: [
            {
               name: "x",
               type: "point",
               range: "width",
               domain: {
                  data: "table",
                  field: "buckets"
               }
            },
            {
               name: "y",
               type: "linear",
               range: "height",
               nice: true,
               zero: true,
               domain: [0, 1]
            },
            {
               name: "color",
               type: "ordinal",
               range: {
                  scheme: model.chartConfiguration.operatorColorSceme,
               },
               domain: this.props.operators,
            }
         ],
         axes: [
            {
               orient: "bottom",
               scale: "x",
               zindex: 1,
               labelOverlap: true,
               values: xTicks(),
               title: model.chartConfiguration.areaChartXTitle,
               titlePadding: model.chartConfiguration.axisPadding,
               titleFont: model.chartConfiguration.axisTitleFont,
               labelFont: model.chartConfiguration.axisLabelFont,
            },
            {
               orient: "left",
               scale: "y",
               zindex: 1,
               title: model.chartConfiguration.areaChartYTitle,
               titlePadding: model.chartConfiguration.axisPadding,
               titleFont: model.chartConfiguration.axisTitleFont,
               labelFont: model.chartConfiguration.axisLabelFont,
            }
         ],
         marks: [
            {
               type: "group",
               from: {
                  facet: {
                     name: "series",
                     data: "table",
                     groupby: "operators"
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
                              value: this.props.currentInterpolation as string,
                           },
                           x: {
                              scale: "x",
                              field: "buckets"
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
                              field: "operators"
                           },
                           tooltip: {
                              signal: `{${model.chartConfiguration.areaChartTooltip}}`,
                           },

                        },
                        update: {
                           fillOpacity: {
                              value: 1
                           }
                        },
                        hover: {
                           fillOpacity: {
                              value: model.chartConfiguration.hoverFillOpacity,
                           },
                        }
                     }
                  }
               ]
            }
         ],
         legends: [{
            fill: "color",
            title: "Operators",
            orient: "right",
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
   currentRequest: state.currentRequest,
   events: state.events,
   operators: state.operators,
   chartIdCounter: state.chartIdCounter,
   chartData: state.chartData,
   currentInterpolation: state.currentInterpolation,
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
});


export default connect(mapStateToProps, mapDispatchToProps)(Context.withAppContext(SwimLanes));
