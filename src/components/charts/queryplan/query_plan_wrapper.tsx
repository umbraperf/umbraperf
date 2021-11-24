import * as model from '../../../model';
import * as Controller from '../../../controller';
import * as Context from '../../../app_context';
import styles from '../../../style/queryplan.module.css';
import Spinner from '../../utils/spinner/spinner';
import React from 'react';
import { connect } from 'react-redux';
import { createRef } from 'react';
import _ from 'lodash';
import WarningIcon from '@material-ui/icons/Warning';
import Typography from '@material-ui/core/Typography';
import QueryPlanViewer from './query_plan_viewer';
import dagre from 'dagre';
import { node } from 'webpack';
import { ConnectionLineType } from 'react-flow-renderer';

export interface QueryPlanWrapperAppstateProps {
    appContext: Context.IAppContext;
    csvParsingFinished: boolean;
    queryPlan: object | undefined;
    currentView: model.ViewType;
    currentOperator: Array<string> | "All";
    operators: Array<string> | undefined;
    setCurrentChart: (newCurrentChart: model.ChartType) => void;
}

interface State {
    height: number,
    width: number,
    loading: boolean,
    renderedFlowPlan: JSX.Element | undefined,
    renderFlowPlan: boolean,
}

export type PlanNode = {
    label: string
    id: string,
    parent: string,
    class: string,
    config?: object,
}

export type PlanEdge = {
    source: string,
    target: string,
    class: string,
    config: object,
}

export type FlowGraphNode = {
    position: {
        x: number;
        y: number;
    };
    data: {
        label: string;
    };
    label: string; //remove
    id: string;
    parent: string; //remove
    class: string; //remove
    config?: object | undefined; //remove
}

export type FlowGraphEdge = {
    id: string,
    source: string,
    target: string,
    type: ConnectionLineType,
    animated: true
}

export type FlowGraphElements = Array<FlowGraphNode | FlowGraphEdge>;

type Props = QueryPlanWrapperAppstateProps & model.IQueryPlanProps;

class QueryPlanWrapper extends React.Component<Props, State> {

    graphContainer = createRef<HTMLDivElement>();

    constructor(props: Props) {
        super(props);
        this.state = {
            height: 0,
            width: 0,
            loading: true,
            renderedFlowPlan: undefined,
            renderFlowPlan: true,
        };

        this.handleNodeClick = this.handleNodeClick.bind(this);
    }

    componentDidUpdate(prevProps: Props, prevState: State): void {
        if (Controller.queryPlanRerenderNeeded(this.props, prevProps, this.state.width, prevState.width)) {
            this.setState((state, props) => ({
                ...state,
                renderedFlowPlan: undefined,
            }));
            this.createQueryPlan();
        }
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

            child.style.display = 'flex';
        }

    }

    isComponentLoading(): boolean {
        if (!this.props.queryPlan || !this.props.operators) {
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
                    <div className={styles.queryplanContainerTitle}>Query Plan</div>
                    {this.state.renderedFlowPlan}
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
            queryplanContent = this.createPlanViewer(queryPlanJson);
        }
        this.setState((state, props) => ({
            ...state,
            loading: false,
            renderedFlowPlan: queryplanContent,
        }));
    }

    createPlanViewer(queryplanJson: object) {

        const rootNode = {
            label: "RESULT",
            id: "root",
            child: queryplanJson,
        }
        const flowGraphData = this.createFlowGraphData(rootNode);

        const planViewer = React.createElement(QueryPlanViewer, {
            key: this.state.height + this.state.width,
            height: this.state.height,
            width: this.state.width,
            graphElements: flowGraphData,
            // nodes: flowGraphData.nodes,
            // edges: flowGraphData.links,
            handleNodeClick: this.handleNodeClick,
        } as any);

        return planViewer;
    }


    handleNodeClick(event: { d3norde: object, original: PlanNode }) {
        //TODO add pipeline, make pipeline in function in controller obliq
        if (this.props.operators!.includes(event.original.id)) {
            //Only trigger operator selection if operator is in measurement data
            Controller.handleOperatorSelection(event.original.id);
        }
    }

    createFlowGraphData(root: Partial<PlanNode> & { child: object }): FlowGraphElements {

        let planData = {
            nodes: new Array<PlanNode>(),
            links: new Array<PlanEdge>()
        }

        const nodeColorScale = model.chartConfiguration.getOperatorColorScheme(this.props.operators!.length, false);

        const nodeClass = (nodeId: string) => {
            if (nodeId === "root") {
                return `${styles.dagreNode} ${styles.dagreRootNode}`;
            } else if (!this.props.operators!.includes(nodeId)) {
                //node does not appear in measurement data
                return `${styles.dagreNode} ${styles.dagreUnavailableNode}`;
            } else if (this.props.currentOperator === "All" || this.props.currentOperator.includes(nodeId)) {
                return `${styles.dagreNode} ${styles.dagreActiveNode}`;
            } else {
                return `${styles.dagreNode} ${styles.dagreInactiveNode}`;
            }
        }

        const nodeColor = (nodeId: string) => {
            if (nodeId === "root") {
                return this.props.appContext.accentBlack;
            } else if (!this.props.operators!.includes(nodeId)) {
                //node does not appear in measurement data
                return this.props.appContext.tertiaryColor;
            } else if (this.props.currentOperator === "All" || this.props.currentOperator.includes(nodeId)) {
                return nodeColorScale[this.props.operators!.indexOf(nodeId)];
            } else {
                return this.props.appContext.tertiaryColor;
            }
        }

        const nodeCornerRadius = "rx: 12; ry: 12";

        planData.nodes.push({
            label: root.label!,
            id: root.id!, parent: "",
            class: nodeClass(root.id!),
            config: { style: `fill: ${nodeColor(root.id!)}; ${nodeCornerRadius}` }
        })
        fillGraph(root.child, root.id!)

        function fillGraph(currentPlanElement: any, parent: string) {

            planData.nodes.push({ label: currentPlanElement.operator, id: currentPlanElement.operator, parent: parent, class: nodeClass(currentPlanElement.operator), config: { style: `fill: ${nodeColor(currentPlanElement.operator)}; ${nodeCornerRadius}` } });
            planData.links.push({ source: parent, target: currentPlanElement.operator, class: styles.dagreEdge, config: { arrowheadStyle: 'display: none' } });

            ["input", "left", "right"].forEach(childType => {
                if (currentPlanElement.hasOwnProperty(childType)) {
                    fillGraph(currentPlanElement[childType], currentPlanElement.operator);
                }
            });
        }

        const flowGraphElements: FlowGraphElements = this.createReactFlowNodesEdges(planData.nodes, planData.links);

        return flowGraphElements;
    }

    getDagreLayoutedElements(nodes: PlanNode[], edges: PlanEdge[]) {

        // TODO give dagre graph width and height for centering?
        // TODO give dagre nodes with, height for alignment
        // TODO place width and height in createReactFlowNodesEdges calculation
        const dagreGraph = new dagre.graphlib.Graph();
        dagreGraph.setGraph({ rankdir: this.getGraphDirection() });
        dagreGraph.setDefaultEdgeLabel(function () { return {}; });

        nodes.forEach((node) => {
            dagreGraph.setNode(node.id, { label: node.label });
        });
        edges.forEach((edge => {
            dagreGraph.setEdge(edge.source, edge.target);
        }));

        dagre.layout(dagreGraph);

        return dagreGraph;
    }


    createReactFlowNodesEdges(nodes: PlanNode[], edges: PlanEdge[]): FlowGraphElements {
        const dagreGraph = this.getDagreLayoutedElements(nodes, edges);

        const reactFlowNodes: FlowGraphNode[] = nodes.map((node) => {
            const nodeWithPosition = dagreGraph.node(node.id);
            const isVertical = this.getGraphDirection() === 'TB';
            const position = {
                //TODO node width
                x: nodeWithPosition.x - 1000 / 2 + Math.random() / 1000,
                y: nodeWithPosition.y - 1000 / 2,
            }
            const reactFlowNode = {
                ...node, //TODO remove
                data: { label: node.label },
                // targetPosition: isVertical ? 'top' : 'left',
                // sourcePosition: isVertical ? 'bottom' : 'right',
                position,
            }
            return reactFlowNode;

        });

        const reactFlowEdges: FlowGraphEdge[] = edges.map((edge) => {
            const reactFlowEdge: FlowGraphEdge = {
                id: edge.source + "-" + edge.target,
                source: edge.source,
                target: edge.target,
                type: ConnectionLineType.SmoothStep,
                animated: true,
            }
            return reactFlowEdge;
        });

        return [...reactFlowNodes, ...reactFlowEdges];
    }

    getGraphDirection() {
        return this.state.height > this.state.width ? 'TB' : 'LR';
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
    operators: state.operators,
});

const mapDispatchToProps = (dispatch: model.Dispatch) => ({
    setCurrentChart: (newCurrentChart: model.ChartType) => dispatch({
        type: model.StateMutationType.SET_CURRENTCHART,
        data: newCurrentChart,
    }),
});


export default connect(mapStateToProps, mapDispatchToProps)(Context.withAppContext(QueryPlanWrapper));
