import * as model from '../../model';
import React from 'react';
import { connect } from 'react-redux';
import { IAppContext, withAppContext } from '../../app_context';
import { Vega } from 'react-vega';
import { Result } from 'src/model/core_result';
import { VisualizationSpec } from "../../../node_modules/react-vega/src";
import styles from '../../style/charts.module.css';
import { Redirect } from 'react-router-dom';


interface Props {
    appContext: IAppContext;
    resultLoading: boolean;
    result: Result | undefined;
}

class BarChart extends React.Component<Props> {

    constructor(props: Props) {
        super(props);

        this.createVisualizationSpec = this.createVisualizationSpec.bind(this);
    }

    createVisualizationData() {
        const data = {
            name: 'table',
            values: [
                { category: 'A', amount: 28 },
                { category: 'B', amount: 55 },
                { category: 'C', amount: 43 },
                { category: 'D', amount: 91 },
                { category: 'E', amount: 81 },
                { category: 'F', amount: 53 },
                { category: 'G', amount: 19 },
                { category: 'H', amount: 87 },
            ],
        };

        return data;
    }

    createVisualizationSpec() {
        const visData = this.createVisualizationData();

        const spec: VisualizationSpec = {
            $schema: 'https://vega.github.io/schema/vega/v5.json',
            width: 1000,
            height: 500,
            padding: { left: 5, right: 5, top: 5, bottom: 5 },

            data: [
                visData
            ],

            signals: [
                {
                    name: 'tooltip',
                    value: {},
                    on: [
                        { events: 'rect:mouseover', update: 'datum' },
                        { events: 'rect:mouseout', update: '{}' },
                    ],
                },
            ],

            scales: [
                {
                    name: 'xscale',
                    type: 'band',
                    domain: { data: 'table', field: 'category' },
                    range: 'width',
                },
                {
                    name: 'yscale',
                    domain: { data: 'table', field: 'amount' },
                    nice: true,
                    range: 'height',
                },
            ],

            axes: [
                { orient: 'bottom', scale: 'xscale' },
                { orient: 'left', scale: 'yscale' },
            ],

            marks: [
                {
                    type: 'rect',
                    from: { data: 'table' },
                    encode: {
                        enter: {
                            x: { scale: 'xscale', field: 'category', offset: 1 },
                            width: { scale: 'xscale', band: 1, offset: -1 },
                            y: { scale: 'yscale', field: 'amount' },
                            y2: { scale: 'yscale', value: 0 },
                        },
                        update: {
                            fill: { value: 'steelblue' },
                        },
                        hover: {
                            fill: { value: 'red' },
                        },
                    },
                },
                {
                    type: 'text',
                    encode: {
                        enter: {
                            align: { value: 'center' },
                            baseline: { value: 'bottom' },
                            fill: { value: '#333' },
                        },
                        update: {
                            x: { scale: 'xscale', signal: 'tooltip.category', band: 0.5 },
                            y: { scale: 'yscale', signal: 'tooltip.amount', offset: -2 },
                            text: { signal: 'tooltip.amount' },
                            fillOpacity: [{ test: 'datum === tooltip', value: 0 }, { value: 1 }],
                        },
                    },
                },
            ],
        } as VisualizationSpec;

        return spec;
    }

    componentDidUpdate(prevProps: Props): void {
        if (prevProps.result != this.props.result && undefined != this.props.result && !this.props.resultLoading) {
            //TODO
        }
    }

    componentDidMount(): void {
        //this.createVisualization();
    }

    //const signalListeners = { hover: handleHover };


    public render() {
        if (!this.props.result) {
            return <Redirect to={"/upload"} />
        }

        return <div>
            <div className={styles.resultArea} >
                <div className={"vegaContainer"}>
                    <Vega spec={this.createVisualizationSpec()} />
                </div>
            </div>
            <div>
                <p>Result of computation from rust is: {this.props.result?.test}</p>
            </div>
        </div>;
    }

}

const mapStateToProps = (state: model.AppState) => ({
    resultLoading: state.resultLoading,
    result: state.result,
});


export default connect(mapStateToProps)(withAppContext(BarChart));



