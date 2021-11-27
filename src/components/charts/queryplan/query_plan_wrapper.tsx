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
import { ConnectionLineType, Position } from 'react-flow-renderer';
import CSS from 'csstype';
import { QueryplanNodeData } from './query_plan_node';

export interface AppstateProps {
    appContext: Context.IAppContext;
    //TODO add to chart data in redux 
    queryPlan: object | undefined;
    currentOperator: Array<string> | "All";
    operators: Array<string> | undefined;
    chartData: model.IQueryPlanData,
}

type Props = model.IQueryPlanProps & AppstateProps;

interface State {
    // height: number,
    // width: number,
    loading: boolean,
    renderedFlowPlan: JSX.Element | undefined,
    renderFlowPlan: boolean,
}

export type PlanNode = {
    label: string
    id: string,
    parent: string,
    borderFill: string,
    backgroundFill: string,
    nodeCursor: string,
    isNodeSelectable: boolean,
}

export type PlanEdge = {
    source: string,
    target: string,
}

export type FlowGraphNode = {
    id: string;
    position: {
        x: number;
        y: number;
    };
    data: QueryplanNodeData;
    targetPosition: Position;
    sourcePosition: Position;
    selectable: boolean;
    type: string,
    style: CSS.Properties;
}

export type FlowGraphEdge = {
    id: string,
    source: string,
    target: string,
    type: ConnectionLineType,
    animated: true,
    style: CSS.Properties,
}

export type FlowGraphElements = Array<FlowGraphNode | FlowGraphEdge>;


class QueryPlanWrapper extends React.Component<Props, State> {

    graphContainer = createRef<HTMLDivElement>();

    constructor(props: Props) {
        super(props);
        this.state = {
            // height: 0,
            // width: 0,
            loading: true,
            renderedFlowPlan: undefined,
            renderFlowPlan: true,
        };

        this.handleOperatorSelection = this.handleOperatorSelection.bind(this);
    }

    // componentDidUpdate(prevProps: Props, prevState: State): void {
        //TODO 
        // if (Controller.queryPlanRerenderNeeded(this.props, prevProps, this.state.width, prevState.width)) {
        //     this.setState((state, props) => ({
        //         ...state,
        //         renderedFlowPlan: undefined,
        //     }));
        //     this.createQueryPlan();
        // }
    // }


    // componentDidMount() {

        // this.setState((state, props) => ({
        //     ...state,
        //     width: this.graphContainer.current!.offsetWidth,
        //     height: this.graphContainer.current!.offsetHeight,
        // }));

        // this.props.setCurrentChart(model.ChartType.QUERY_PLAN);

    // }


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
            key: this.props.height + this.props.width,
            height: this.props.height,
            width: this.props.width,
            graphElements: flowGraphData,
            handleOperatorSelection: this.handleOperatorSelection,
        } as any);

        return planViewer;
    }


    handleOperatorSelection(elementId: string) {
        if (this.props.operators!.includes(elementId)) {
            //Only trigger operator selection if operator is in measurement data
            Controller.handleOperatorSelection(elementId);
        }
    }

    createFlowGraphData(root: Partial<PlanNode> & { child: object }): FlowGraphElements {

        let planData = {
            nodes: new Array<PlanNode>(),
            links: new Array<PlanEdge>()
        }

        const nodeColorScale = model.chartConfiguration.getOperatorColorScheme(this.props.operators!.length, false);
        const nodeBackgroundColorScale = model.chartConfiguration.getOperatorColorScheme(this.props.operators!.length, false, 0.1);

        const nodeCursor = (nodeId: string) => {
            //return tuple with 0: cursor style, 1: node selectable flag
            if (nodeId === "root") {
                return ["default", false];
            } else if (!this.props.operators!.includes(nodeId)) {
                //node does not appear in measurement data
                return ["not-allowed", false];
            } else {
                return ["pointer", true];
            }
        }

        const nodeColor = (nodeId: string) => {
            //add 33 to hex color for 10% opacity
            //return tuple with 0: border color, 1: background color
            const lowOpacity = "33";
            if (nodeId === "root") {
                return [this.props.appContext.secondaryColor, '#fff'];
            } else if (!this.props.operators!.includes(nodeId)) {
                //node does not appear in measurement data
                return [this.props.appContext.tertiaryColor, this.props.appContext.tertiaryColor + lowOpacity];
            } else if (this.props.currentOperator === "All" || this.props.currentOperator.includes(nodeId)) {
                const operatorIndex = this.props.operators!.indexOf(nodeId);
                return [nodeColorScale[operatorIndex], nodeBackgroundColorScale[operatorIndex]];
            } else {
                return [this.props.appContext.tertiaryColor, '#fff'];
            }
        }

        const rootCursor = nodeCursor(root.id!);
        const rootColor = nodeColor(root.id!);
        planData.nodes.push({
            label: root.label!,
            id: root.id!, parent: "",
            nodeCursor: rootCursor[0] as string,
            isNodeSelectable: rootCursor[1] as boolean,
            borderFill: rootColor[0],
            backgroundFill: rootColor[1],

        })
        fillGraph(root.child, root.id!)

        function fillGraph(currentPlanElement: any, parent: string) {

            const planNodeCursor = nodeCursor(currentPlanElement.operator);
            const planNodeColor = nodeColor(currentPlanElement.operator);
            planData.nodes.push({
                label: currentPlanElement.operator,
                id: currentPlanElement.operator,
                parent: parent,
                nodeCursor: planNodeCursor[0] as string,
                isNodeSelectable: planNodeCursor[1] as boolean,
                borderFill: planNodeColor[0],
                backgroundFill: planNodeColor[1],

            });
            planData.links.push({
                source: parent,
                target: currentPlanElement.operator,
            });

            ["input", "left", "right"].forEach(childType => {
                if (currentPlanElement.hasOwnProperty(childType)) {
                    fillGraph(currentPlanElement[childType], currentPlanElement.operator);
                }
            });
        }

        const flowGraphElements: FlowGraphElements = this.createReactFlowNodesEdges(planData.nodes, planData.links);

        return flowGraphElements;
    }

    createReactFlowNodesEdges(nodes: PlanNode[], edges: PlanEdge[]): FlowGraphElements {
        const nodeWidth = 150;
        const nodeHight = 35;
        const dagreGraph = this.getDagreLayoutedElements(nodes, edges, nodeWidth, nodeHight);

        const isVertical = this.getGraphDirection() === 'TB';

        const reactFlowNodes: FlowGraphNode[] = nodes.map((node) => {
            const nodeWithPosition = dagreGraph.node(node.id);
            const position = {
                x: nodeWithPosition.x - nodeWidth / 2 + Math.random() / 1000,
                y: nodeWithPosition.y - nodeHight / 2,
            }
            const style: CSS.Properties = {
                border: 'solid',
                width: '130px',
                height: '30px',
                borderWidth: '4px',
                borderRadius: '25px',
                backgroundColor: node.backgroundFill,
                borderColor: node.borderFill,
                cursor: node.nodeCursor,
                fontSize: '15px',
            }

            const data: QueryplanNodeData = {
                label: node.label.length > 15 ? node.label.substring(0, 14) + "..." : node.label,
            }

            const reactFlowNode: FlowGraphNode = {
                id: node.id,
                data,
                position,
                style,
                targetPosition: isVertical ? Position.Bottom : Position.Right,
                sourcePosition: isVertical ? Position.Top : Position.Left,
                selectable: node.isNodeSelectable,
                type: 'queryplanNode',
            }
            return reactFlowNode;

        });

        const reactFlowEdges: FlowGraphEdge[] = edges.map((edge) => {
            const reactFlowEdge: FlowGraphEdge = {
                //turn around source and target to invert direction of edge animation
                id: edge.source + "_" + edge.target,
                source: edge.target,
                target: edge.source,
                type: ConnectionLineType.SmoothStep,
                animated: true,
                style: {
                    stroke: this.props.appContext.accentBlack,
                    strokeWidth: '2px'
                },
            }
            return reactFlowEdge;
        });

        return [...reactFlowNodes, ...reactFlowEdges];
    }

    getDagreLayoutedElements(nodes: PlanNode[], edges: PlanEdge[], nodeWidth: number, nodeHight: number) {

        const dagreGraph = new dagre.graphlib.Graph();
        dagreGraph.setGraph({ rankdir: this.getGraphDirection() });
        dagreGraph.setDefaultEdgeLabel(function () { return {}; });

        nodes.forEach((node) => {
            dagreGraph.setNode(node.id, { label: node.label, width: nodeWidth, height: nodeHight });
        });
        edges.forEach((edge => {
            dagreGraph.setEdge(edge.source, edge.target);
        }));

        dagre.layout(dagreGraph);

        return dagreGraph;
    }

    getGraphDirection() {
        return this.props.height > this.props.width ? 'TB' : 'LR';
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


const mapStateToProps = (state: model.AppState, ownProps: model.IQueryPlanProps) => ({
    queryPlan: state.queryPlan,
    currentOperator: state.currentOperator,
    operators: state.operators,
    chartData: state.chartData[ownProps.chartId].chartData.data as model.IQueryPlanData,
});



export default connect(mapStateToProps, undefined)(Context.withAppContext(QueryPlanWrapper));
