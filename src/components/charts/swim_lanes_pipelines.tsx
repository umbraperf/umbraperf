import * as model from '../../model';
import * as Controller from '../../controller/request_controller';
import * as Context from '../../app_context';
import React from 'react';
import { connect } from 'react-redux';
import { Vega } from 'react-vega';
import { VisualizationSpec } from "react-vega/src";
import { Redirect } from 'react-router-dom';
import { createRef } from 'react';
import { CircularProgress } from '@material-ui/core';
import _ from "lodash";



interface Props {
   appContext: Context.IAppContext;
   resultLoading: model.ResultLoading;
   result: model.Result | undefined;
   csvParsingFinished: boolean;
   currentChart: string;
   currentEvent: string;
   currentRequest: model.RestQueryType | undefined;
   events: Array<string> | undefined;
   chartIdCounter: number;
   chartData: model.ChartDataKeyValue,
   multipleChartDataLength: number;
   currentInterpolation: String,
   currentBucketSize: number,
   currentPipeline: Array<string> | undefined,
   setCurrentChart: (newCurrentChart: string) => void;
   setChartIdCounter: (newChartIdCounter: number) => void;

}

interface State {
   chartId: number,
   chartData: Array<model.ISwimlanesData>,
   width: number,
   height: number,
}

const startSize = {
   width: 400,
   height: 150,
}

class SwimLanesPipelines extends React.Component<Props, State> {

   chartWrapper = createRef<HTMLDivElement>();

   constructor(props: Props) {
      super(props);
      this.state = {
         chartId: this.props.chartIdCounter,
         width: startSize.width,
         height: startSize.height,
         chartData: [],
      };
      this.props.setChartIdCounter(this.state.chartId + 1);

      this.createVisualizationSpec = this.createVisualizationSpec.bind(this);
   }

   componentDidUpdate(prevProps: Props, prevState: State): void {

      // update component and add new data to component state as soon as further pipeline in array received. Remove dublicates with lodash.
      if (this.props.chartData[this.state.chartId] && this.props.multipleChartDataLength > prevProps.multipleChartDataLength) {
         this.setState((state, props) => {
            const newChartDataArray = _.union(state.chartData, ((this.props.chartData[this.state.chartId] as model.ChartDataObject).chartData.data) as model.ISwimlanesData[]);

            return {
               ...this.state,
               chartData: newChartDataArray,
            }

         });
      }

      //if current event, chart or bucketsize changes, component did update is executed and queries new data for new event, only if curent event already set
      if (this.props.currentEvent &&
         (this.props.currentEvent !== prevProps.currentEvent ||
            this.props.currentBucketSize !== prevProps.currentBucketSize ||
            this.props.chartIdCounter !== prevProps.chartIdCounter)) {
         this.setState((state, props) => ({
            ...state,
            chartData: [],
         }));
         Controller.requestChartData(this.props.appContext.controller, this.state.chartId, model.ChartType.SWIM_LANES_PIPELINES, { bucksetsize: "" + this.props.currentBucketSize });
      }

   }


   componentDidMount() {
      if (this.props.csvParsingFinished) {
         this.props.setCurrentChart(model.ChartType.SWIM_LANES_PIPELINES);

         if (!this.props.currentPipeline) {
            Controller.requestPipelines(this.props.appContext.controller);
         }

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


   public render() {

      if (!this.props.csvParsingFinished) {
         return <Redirect to={"/upload"} />
      }

      return <div>
         {(this.props.resultLoading[this.state.chartId] || !this.state.chartData || !this.props.events || !this.props.currentPipeline)
            ? <CircularProgress />
            : <div className={"vegaContainer"} ref={this.chartWrapper}>
               {this.state.chartData.map((elem, index) => (<Vega className={`vegaSwimlane${index}`} key={index} spec={this.createVisualizationSpec(index)} />))}
            </div>
         }
      </div>;
   }


   createVisualizationData(chartId: number) {

      const data = {
         "name": "table",
         "values": this.state.chartData[chartId],
         transform: [
            { "type": "flatten", "fields": ["buckets", "operators", "frequency"] },
            { "type": "collect", "sort": { "field": "operators" } },
            { "type": "stack", "groupby": ["buckets"], "field": "frequency" }
         ]
      };

      return data;
   }

   createVisualizationSpec(chartId: number) {

      const visData = this.createVisualizationData(chartId);

      const xTicks = () => {

         const bucketsArrayLength = this.state.chartData[chartId].buckets.length;
         const numberOfTicks = 30;

         if (bucketsArrayLength > numberOfTicks) {

            let ticks = [];

            const delta = Math.floor(bucketsArrayLength / numberOfTicks);

            for (let i = 0; i < bucketsArrayLength; i = i + delta) {
               ticks.push(this.state.chartData[chartId].buckets[i]);
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
            text: {signal: "currentPipeline"},
            align: model.chartConfiguration.titleAlign,
            dy: model.chartConfiguration.titlePadding,
            font: model.chartConfiguration.titleFont
         },

         data: [
            visData
         ],

         signals: [
            {
               name: "currentPipeline",
               value: this.props.currentPipeline![chartId],
            }
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
                  scheme: "tableau20",
               },
               domain: {
                  data: "table",
                  field: "operators"
               }
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
               tickCount: 5,
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
                              signal: `{'Pipeline': currentPipeline, ${model.chartConfiguration.areaChartTooltip}}`,
                           },

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
         ],
         legends: [{
            fill: "color",
            title: "Operators",
            orient: "right",
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
   multipleChartDataLength: state.multipleChartDataLength,
   currentInterpolation: state.currentInterpolation,
   currentBucketSize: state.currentBucketSize,
   currentPipeline: state.currentPipeline,
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


export default connect(mapStateToProps, mapDispatchToProps)(Context.withAppContext(SwimLanesPipelines));



