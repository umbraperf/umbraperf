import * as model from '../../model';
import React from 'react';
import { connect } from 'react-redux';
import { IAppContext, withAppContext } from '../../app_context';
import { Vega } from 'react-vega';
import { Result } from 'src/model/core_result';
import { VisualizationSpec } from "react-vega/src";
import styles from '../../style/charts.module.css';
import { Redirect } from 'react-router-dom';
import { createRef } from 'react';
import { ChartType, createRequestForRust } from '../../controller/web_file_controller';
import { CircularProgress } from '@material-ui/core';
import InterpolationDropdown from '../utils/interpolation_dropdown';
import EventsButtons from '../utils/events_buttons';
import * as RestApi from '../../model/rest_queries';
import BucketsizeDropdwn from '../utils/bucketsize_dropdown';
import { requestEvents } from '../../controller/web_file_controller'



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
   setCurrentChart: (newCurrentChart: string) => void;
   setCurrentEvent: (newCurrentEvent: string) => void;
   setChartIdCounter: (newChartIdCounter: number) => void;

}

interface State {
   chartId: number,
   chartData: Array<IChartData>,
   width: number,
   height: number,
   interpolation: string;
   bucketsize: number;
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

class SwimLanesPipelines extends React.Component<Props, State> {

   chartWrapper = createRef<HTMLDivElement>();

   constructor(props: Props) {
      super(props);
      this.state = {
         chartId: this.props.chartIdCounter,
         width: startSize.width,
         height: startSize.height,
         chartData: [],
         interpolation: "basis",
         bucketsize: 0.2,
      };
      this.props.setChartIdCounter(this.state.chartId + 1);

      this.createVisualizationSpec = this.createVisualizationSpec.bind(this);
      this.handleInterpolationChange = this.handleInterpolationChange.bind(this);
      this.handleBucketsizeChange = this.handleBucketsizeChange.bind(this);
   }

   componentDidUpdate(prevProps: Props, prevState: State): void {

      //ensure changed app state and only proceed when result available
      if (!this.props.resultLoading && prevProps.resultLoading != this.props.resultLoading) {

/*          const chartDataElement: IChartData = {
            buckets: ((this.props.chartData[this.state.chartId] as model.ChartDataObject).chartData.data as model.ISwimlanesData).buckets,
            operators: ((this.props.chartData[this.state.chartId] as model.ChartDataObject).chartData.data as model.ISwimlanesData).operators,
            relativeFrquencies: ((this.props.chartData[this.state.chartId] as model.ChartDataObject).chartData.data as model.ISwimlanesData).relativeFrquencies,
         }

         this.setState((state, props) => {
            const newChartDataArray = state.chartData.concat(chartDataElement);
            return {
               ...this.state,
               chartData: newChartDataArray,
            }
         }); */

      }

      //if current event changes, component did update is executed and queries new data for new event
      if (this.props.currentEvent != prevProps.currentEvent || this.state.bucketsize != prevState.bucketsize) {
         this.setState((state, props) => ({
            ...state,
            chartData: [],
         }));
         createRequestForRust(this.props.appContext.controller, this.state.chartId, ChartType.SWIM_LANES_PIPELINES, "" + this.state.bucketsize);
      }

   }


   componentDidMount() {
      if (this.props.csvParsingFinished) {
         this.props.setCurrentChart(ChartType.SWIM_LANES_PIPELINES);

         if (!this.props.events) {
            requestEvents(this.props.appContext.controller);
         } else {
            this.props.setCurrentEvent(this.props.events[0]);
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

   handleInterpolationChange(newInterpolation: string) {
      this.setState({
         ...this.state,
         interpolation: newInterpolation,
      });
   }

   handleBucketsizeChange(newBucketsize: number) {
      this.setState({
         ...this.state,
         bucketsize: newBucketsize,
      });
   }


   public render() {

      const interpolationDropdownProps = {
         currentInterpolation: this.state.interpolation,
         changeInterpolation: this.handleInterpolationChange,
      }

      const bucketsizeDropdownProps = {
         currentBucketsize: this.state.bucketsize,
         changeBucketsize: this.handleBucketsizeChange,
      }

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
                  <EventsButtons events={this.props.events}></EventsButtons>
                  <div className={styles.dropdownArea} >
                     <InterpolationDropdown {...interpolationDropdownProps}></InterpolationDropdown>
                     <BucketsizeDropdwn {...bucketsizeDropdownProps}></BucketsizeDropdwn>
                  </div>
               </div>
               {(this.props.resultLoading || !this.props.chartData[this.state.chartId])
                  ? <CircularProgress />
                  : <div className={"vegaContainer"} ref={this.chartWrapper}>
                     {this.state.chartData.map((elem, index) => (<Vega className={`vegaSwimlane${index}`} key={index} spec={this.createVisualizationSpec(index)} />))}
                  </div>
               }
            </div>
         }
      </div>;
   }


   createVisualizationData(chartId: number) {
      console.log(this.state.chartData);
      console.log(chartId);


      const data = {
         "name": "table",
         "values": this.state.chartData[chartId],
         transform: [
            { "type": "flatten", "fields": ["buckets", "operators", "relativeFrquencies"] },
            { "type": "collect", "sort": { "field": "operators" } },
            { "type": "stack", "groupby": ["buckets"], "field": "relativeFrquencies" }
         ]
      };

      return data;
   }

   createVisualizationSpec(chartId: number) {
      console.log(this.state.chartData[chartId].buckets);

      const visData = this.createVisualizationData(chartId);

      const xTicks = () => {

         const bucketsArrayLength = this.state.chartData[chartId].buckets.length;
         const numberOfTicks = 40;

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
                  field: "buckets"
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
               values: xTicks()
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
                              value: this.state.interpolation,
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
                              "field": "buckets",
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


export default connect(mapStateToProps, mapDispatchToProps)(withAppContext(SwimLanesPipelines));



