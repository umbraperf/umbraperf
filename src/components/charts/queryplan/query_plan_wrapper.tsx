import * as model from '../../../model';
import * as Controller from '../../../controller';
import * as Context from '../../../app_context';
import styles from '../../../style/queryplan.module.css';
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
import { QueryplanNodeTooltipData } from './query_plan_node_tooltip_content';

export interface AppstateProps {
    appContext: Context.IAppContext;
    currentOperator: Array<string> | "All";
    currentOperatorTimeframe: Array<string> | "All";
    operators: model.IOperatorsData | undefined;
    chartData: model.IQueryPlanData,
}

type Props = model.IQueryPlanProps & AppstateProps;

interface State {
    loading: boolean,
    renderedFlowPlan: JSX.Element | undefined,
    renderFlowPlan: boolean,
    // currentUirOperators: Array<string>,
}

export type PlanNode = {
    label: string
    id: string,
    parent: string,
    borderFill: string,
    backgroundFill: string,
    nodeCursor: string,
    textColor: string,
    isNodeSelectable: boolean,
    tooltipData: QueryplanNodeTooltipData,
}

export type PlanEdge = {
    source: string,
    target: string,
    cardinality: number | undefined,
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
    animated: boolean,
    style: CSS.Properties,
    label: string | undefined,
    labelStyle: CSS.Properties,
}

export type FlowGraphElements = Array<FlowGraphNode | FlowGraphEdge>;


class QueryPlanWrapper extends React.Component<Props, State> {

    graphContainer = createRef<HTMLDivElement>();

    constructor(props: Props) {
        super(props);
        this.state = {
            loading: true,
            renderedFlowPlan: undefined,
            renderFlowPlan: true,
            // currentUirOperators: this.getCurrentUirOperators(),
        };
    }

    componentDidMount() {
        this.createQueryPlan();
    }

    componentDidUpdate(prevProps: Props) {
        if (!_.isEqual(this.props.currentOperatorTimeframe, prevProps.currentOperatorTimeframe)) {
            this.updateQueryPlan();
        }
    }

    public render() {

        return <div id="queryplanContainer" className={styles.queryplanContainer}>
            <div className={styles.queryplanContainerTitle}>Query Plan</div>
            {this.state.renderedFlowPlan}
        </div>
    }

    updateQueryPlan() {
        this.setState((state, props) => ({
            ...state,
            loading: true,
            renderedFlowPlan: undefined,
        }));
        this.createQueryPlan();
    }

    createQueryPlan() {
        const queryPlanJson = this.props.chartData.queryplanData;
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
        } as any);

        return planViewer;
    }

    createFlowGraphData(root: Partial<PlanNode> & { child: object }): FlowGraphElements {

        let planData = {
            nodes: new Array<PlanNode>(),
            links: new Array<PlanEdge>()
        }

        const isNodeUnavailable = (nodeId: string) => {
            return !(this.props.operators!.operatorsId.includes(nodeId) && (this.props.currentOperatorTimeframe === "All" || this.props.currentOperatorTimeframe.includes(nodeId)))
        }

        const isNodeSelected = (nodeId: string) => {
            return this.props.currentOperator === "All" || this.props.currentOperator.includes(nodeId);
        }

        const nodeCursor = (nodeId: string) => {
            //return tuple with 0: cursor style, 1: node selectable flag
            if (nodeId === "root") {
                return ["default", false];
            } else if (isNodeUnavailable(nodeId)) {
                //node does not appear in measurement data or in uri data, hence enable/disable makes no sense
                return ["not-allowed", false];
            } else {
                return ["pointer", true];
            }
        }

        const nodeColor = (nodeId: string) => {
            //return tuple with 0: border color, 1: background color
            if (nodeId === "root") {
                //root node
                return [this.props.appContext.secondaryColor, '#fff'];
            } else if (isNodeUnavailable(nodeId)) {
                //node does not appear in measurement data or in uri data, hence enable/disable makes no sense
                return ['#fff', this.props.appContext.tertiaryColor + model.chartConfiguration.colorLowOpacityHex];
            } else if (isNodeSelected(nodeId)) {
                //active node
                const operatorIndex = this.props.operators!.operatorsId.indexOf(nodeId);
                return ['#fff', model.chartConfiguration.colorScale!.operatorsIdColorScale[operatorIndex]];
            } else {
                //inactive node
                const operatorIndex = this.props.operators!.operatorsId.indexOf(nodeId);
                return ['#fff', model.chartConfiguration.colorScale!.operatorsIdColorScaleLowOpacity[operatorIndex],];
            }
        }

        const nodeTextColor = (nodeId: string) => {
            if(isNodeUnavailable(nodeId)){
                return '#919191';
            }else {
                return this.props.appContext.accentBlack;
            }
        }

        const nodeTooltipData = (nodeId: string): QueryplanNodeTooltipData => {
            const tooltipUirLines: string[] = [];
            const tooltipUirLineNumbers: number[] = [];
            const tooltipUirOccurrences: number[] = [];
            let tooltipUirTotalOccurrences: number = 0;
            this.props.chartData.nodeTooltipData.operators.forEach((operator: string, index: number) => {
                if (operator === nodeId) {
                    tooltipUirLines.push(this.props.chartData.nodeTooltipData.uirLines[index]);
                    tooltipUirLineNumbers.push(this.props.chartData.nodeTooltipData.uirLineNumbers[index]);
                    tooltipUirOccurrences.push(this.props.chartData.nodeTooltipData.eventOccurrences[index]);
                    if (tooltipUirTotalOccurrences === 0) tooltipUirTotalOccurrences = this.props.chartData.nodeTooltipData.operatorTotalFrequency[index];
                }
            });
            return {
                uirLines: tooltipUirLines,
                uirLineNumber: tooltipUirLineNumbers,
                eventOccurrences: tooltipUirOccurrences,
                totalEventOccurrence: tooltipUirTotalOccurrences,
            }
        }

        const rootCursor = nodeCursor(root.id!);
        const rootColor = nodeColor(root.id!);
        const rootTextColor = nodeTextColor(root.id!);
        const rootTooltipData = nodeTooltipData(root.id!);
        planData.nodes.push({
            label: root.label!,
            id: root.id!, parent: "",
            nodeCursor: rootCursor[0] as string,
            isNodeSelectable: rootCursor[1] as boolean,
            borderFill: rootColor[0],
            backgroundFill: rootColor[1],
            textColor: rootTextColor,
            tooltipData: rootTooltipData,
        })
        fillGraph(root.child, root.id!);

        function fillGraph(currentPlanElement: any, parent: string) {

            const planNodeCursor = nodeCursor(currentPlanElement.operator);
            const planNodeColor = nodeColor(currentPlanElement.operator);
            const planNodeTextColor = nodeTextColor(currentPlanElement.operator);
            const planNodeTooltipData = nodeTooltipData(currentPlanElement.operator);

            planData.nodes.push({
                label: currentPlanElement.operator,
                id: currentPlanElement.operator,
                parent: parent,
                nodeCursor: planNodeCursor[0] as string,
                isNodeSelectable: planNodeCursor[1] as boolean,
                borderFill: planNodeColor[0],
                backgroundFill: planNodeColor[1],
                textColor: planNodeTextColor,
                tooltipData: planNodeTooltipData,
            });
            planData.links.push({
                source: parent,
                target: currentPlanElement.operator,
                cardinality: currentPlanElement.cardinality,
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
                color: node.textColor,
            }

            const data: QueryplanNodeData = {
                label: node.label.length > 15 ? node.label.substring(0, 14) + "..." : node.label,
                tooltipData: node.tooltipData,
            }

            const reactFlowNode: FlowGraphNode = {
                id: node.id,
                data,
                position,
                style,
                targetPosition: isVertical ? Position.Bottom : Position.Left,
                sourcePosition: isVertical ? Position.Top : Position.Right,
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
                type: ConnectionLineType.Bezier,
                style: {
                    stroke: this.props.appContext.tertiaryColor,
                    strokeWidth: '1px'
                },
                animated: false,
                label: edge.cardinality ? `${model.chartConfiguration.nFormatter(+edge.cardinality, 1)}` : "",
                labelStyle: {
                    fill: this.props.appContext.tertiaryColor,
                }
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
        return this.props.height > this.props.width ? 'TB' : 'RL';
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
    currentOperator: state.currentOperator,
    operators: state.operators,
    chartData: state.chartData[ownProps.chartId].chartData.data as model.IQueryPlanData,
    currentOperatorTimeframe: state.currentOperatorTimeframe,
});


export default connect(mapStateToProps, undefined)(Context.withAppContext(QueryPlanWrapper));
