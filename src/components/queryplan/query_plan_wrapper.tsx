import * as model from '../../model';
import * as Controller from '../../controller';
import * as Context from '../../app_context';
import styles from '../../style/queryplan.module.css';
import Spinner from '../utils/spinner';
import React from 'react';
import { connect } from 'react-redux';
import { createRef } from 'react';
import _ from 'lodash';
import WarningIcon from '@material-ui/icons/Warning';
import Typography from '@material-ui/core/Typography';
import QueryPlanViewer from './query_plan_viewer';
import { unmountComponentAtNode } from 'react-dom';


interface Props {
    appContext: Context.IAppContext;
    csvParsingFinished: boolean;
    queryPlan: object | undefined;
    currentView: model.ViewType;
    currentOperator: Array<string> | "All";
    setCurrentChart: (newCurrentChart: string) => void;
}

interface State {
    height: number,
    width: number,
    loading: boolean,
    renderedDagrePlan: JSX.Element | undefined,
    renderDagrePlan: boolean,
}

export type DagreNode = {
    label: string
    id: string,
    parent: string,
    class: string,
    config?: object,
}

export type DagreEdge = {
    source: string,
    target: string,
    class: string,
    config: object,
}


class QueryPlanWrapper extends React.Component<Props, State> {

    graphContainer = createRef<HTMLDivElement>();


    constructor(props: Props) {
        super(props);
        this.state = {
            height: 0,
            width: 0,
            loading: true,
            renderedDagrePlan: undefined,
            renderDagrePlan: true,
        };

    }

    componentDidUpdate(prevProps: Props, prevState: State): void {
        if (this.props.queryPlan !== prevProps.queryPlan ||
            this.props.currentView !== prevProps.currentView ||
            this.state.width !== prevState.width ||
            !_.isEqual(this.props.currentOperator, prevProps.currentOperator)) {
            this.setState((state, props) => ({
                ...state,
                renderedDagrePlan: undefined,
            }));
            this.createQueryPlan();
        }

        // if (this.state.width !== prevState.width && prevState.width !== 0) {
        //     this.setState((state, props) => ({
        //         ...state,
        //         renderedDagrePlan: undefined,
        //     }));
        //     this.createQueryPlan();
        // }
    }


    componentDidMount() {

        this.setState((state, props) => ({
            ...state,
            width: this.graphContainer.current!.offsetWidth,
            height: this.graphContainer.current!.offsetHeight,
        }));

        this.props.setCurrentChart(model.ChartType.QUERY_PLAN);

        addEventListener('resize', (event) => {
            this.resizeListener();
        });


    }

    resizeListener() {
        if (!this.graphContainer) return;

        console.log(this.graphContainer)
        const child = this.graphContainer.current;
        if (child) {
            const newWidth = child.offsetWidth;

            child.style.display = 'none';

            let resizingTimeoutId = undefined;
            clearTimeout(resizingTimeoutId);
            resizingTimeoutId = setTimeout(() => {
                this.setState((state, props) => ({
                    ...state,
                    width: newWidth,
                    //  renderedDagrePlan: undefined,
                }));
            }, 500);

            // this.setState((state, props) => ({
            //     ...state,
            //     width: newWidth,
            //     //  renderedDagrePlan: undefined,
            // }));

            child.style.display = 'block';
        }

    }

    isComponentLoading(): boolean {
        if (!this.props.queryPlan) {
            return true;
        } else {
            return false;
        }
    }

    public render() {

        return <div ref={this.graphContainer} className={styles.elementWrapper}>
            {this.isComponentLoading()
                ? <Spinner />
                : <div id="queryplanContainer" className={styles.queryplanContainer}>
                    {this.state.renderedDagrePlan}
                </div>
            }
        </div>;
    }

    createQueryPlan() {
        const queryPlanJson = this.props.queryPlan;
        let queryplanContent: JSX.Element;

        if (undefined === queryPlanJson || queryPlanJson.hasOwnProperty('error')) {
            queryplanContent = this.createNoQueryPlanWarning();
        } else {
            queryplanContent = this.prepareDagrePlan(queryPlanJson);
        }
        this.setState((state, props) => ({
            ...state,
            loading: false,
            renderedDagrePlan: queryplanContent,
        }));
    }

    prepareDagrePlan(queryplanJson: object) {

        const rootNode = {
            label: "RESULT",
            id: "root",
            child: queryplanJson,
        }
        const dagreData = this.createDagreNodesLinks(rootNode);

        const dagreGraph = React.createElement(QueryPlanViewer, {
            height: this.state.height,
            width: this.state.width,
            nodes: dagreData.nodes,
            edges: dagreData.links,
            handleNodeClick: this.handleNodeClick,
        });

        return dagreGraph;
    }


    handleNodeClick(event: { d3norde: object, original: DagreNode }) {
        //TODO add pipeline, make pipeline in function in controller obliq
        Controller.handleOperatorSelection(event.original.id);
    }

    createDagreNodesLinks(root: Partial<DagreNode> & { child: object }) {

        let dagreData = {
            nodes: new Array<DagreNode>(),
            links: new Array<DagreEdge>()
        }

        const nodeClass = (nodeId: string) => {
            if (this.props.currentOperator === "All" || this.props.currentOperator.includes(nodeId)) {
                return `${styles.dagreNode} ${styles.dagreActiveNode}`;
            } else {
                return `${styles.dagreNode} ${styles.dagreActiveNode}`;
            }
        }

        const nodeColor = (nodeId: string) => {
            if (this.props.currentOperator === "All" || this.props.currentOperator.includes(nodeId)) {
                return this.props.appContext.secondaryColor;
            } else {
                return this.props.appContext.tertiaryColor;
            }
        }

        dagreData.nodes.push({ label: root.label!, id: root.id!, parent: "", class: `${styles.dagreNode} ${styles.dagreRootNode}`, config: { style: `fill: ${this.props.appContext.accentBlack}` } })
        fillGraph(root.child, root.id!)

        function fillGraph(currentPlanElement: any, parent: string) {

            dagreData.nodes.push({ label: currentPlanElement.operator, id: currentPlanElement.operator, parent: parent, class: nodeClass(currentPlanElement.operator), config: { style: `fill: ${nodeColor(currentPlanElement.operator)}` } });
            dagreData.links.push({ source: parent, target: currentPlanElement.operator, class: styles.dagreEdge, config: { arrowheadStyle: 'display: none' } });

            ["input", "left", "right"].forEach(childType => {
                if (currentPlanElement.hasOwnProperty(childType)) {
                    fillGraph(currentPlanElement[childType], currentPlanElement.operator);
                }
            });
        }

        return dagreData;

    }

    createNoQueryPlanWarning() {
        return <div className={styles.warningContainer}>
            <WarningIcon
                fontSize="large"
                color="secondary"
            />
            <Typography
                style={{ color: this.props.appContext.tertiaryColor }}
                variant="caption"
            >
                A Problem occured reading the query plan.
            </Typography>
        </div>
    }
}


const mapStateToProps = (state: model.AppState) => ({
    csvParsingFinished: state.csvParsingFinished,
    queryPlan: state.queryPlan,
    currentView: state.currentView,
    currentOperator: state.currentOperator,
});

const mapDispatchToProps = (dispatch: model.Dispatch) => ({
    setCurrentChart: (newCurrentChart: string) => dispatch({
        type: model.StateMutationType.SET_CURRENTCHART,
        data: newCurrentChart,
    }),
});


export default connect(mapStateToProps, mapDispatchToProps)(Context.withAppContext(QueryPlanWrapper));
