import styles from '../../../style/queryplan.module.css';
import React from 'react';
import _ from 'lodash';
import { FlowGraphElements, FlowGraphNode } from './query_plan_wrapper';
import ReactFlow, { ConnectionLineType, Controls, ReactFlowProvider } from 'react-flow-renderer';
import QueryPlanNodeTooltip from './query_plan_node_tooltip';
import QueryplanNode from './query_plan_node';


// interface State {
//     isNodeHover: boolean,
//     tooltipPositionX: number | undefined,
//     tooltipPositionY: number | undefined,
//     hoverNodeId: string,
// }

interface Props {
    key: number; //trigers complete rerender for repositioning
    height: number;
    width: number;
    graphElements: FlowGraphElements,
    handleOperatorSelection: (elementId: string) => void;
}

class QueryPlanViewer extends React.Component<Props, {}> {


    constructor(props: Props) {
        super(props);
        // this.state = {
        //     isNodeHover: false,
        //     tooltipPositionX: undefined,
        //     tooltipPositionY: undefined,
        //     hoverNodeId: "",
        // }

        // this.handleNodeMouseEnter = this.handleNodeMouseEnter.bind(this);
        // this.handleNodeMouseLeave = this.handleNodeMouseLeave.bind(this);
    }

    // handleNodeMouseEnter(event: React.MouseEvent, element: FlowGraphNode) {
    //     console.log(element.position.x);
    //     if (false === this.state.isNodeHover) {
    //         this.setState((state, props) => ({
    //             ...state,
    //             isNodeHover: true,
    //             tooltipPositionX: element.position.x,
    //             tooltipPositionY: element.position.y,
    //             hoverNodeId: element.id,
    //         }))
    //     }
    // }

    // handleNodeMouseLeave(event: React.MouseEvent, element: FlowGraphNode) {
    //     if (true === this.state.isNodeHover) {
    //         this.setState((state, props) => ({
    //             ...state,
    //             isNodeHover: false,
    //         }))
    //     }
    // }

    // createNodeTooltip() {
    //     return this.state.isNodeHover && <QueryPlanNodeTooltip
    //         positionX={this.state.tooltipPositionX!}
    //         positionY={this.state.tooltipPositionY!}
    //         nodeId={this.state.hoverNodeId}
    //     />
    // }

    handleNodeClick(event: React.MouseEvent, element: FlowGraphNode) {
        this.props.handleOperatorSelection(element.id);
    }

    onLoad(reactFlowInstance: any) {
        //Fit graph to view after load
        reactFlowInstance.fitView();
    }

    createReactFlowGraph() {

        const nodeTypes = {
            queryplanNode: QueryplanNode,
        };

        return <div
            className={styles.reactFlowGraph}
        >
            <ReactFlowProvider>
                <ReactFlow
                    elements={this.props.graphElements}
                    minZoom={0.1}
                    maxZoom={3}
                    // onNodeMouseEnter={(event, element) => this.handleNodeMouseEnter(event, element as FlowGraphNode)}
                    // onNodeMouseLeave={(event, element) => this.handleNodeMouseLeave(event, element as FlowGraphNode)}
                    nodesConnectable={false}
                    nodesDraggable={true}
                    connectionLineType={ConnectionLineType.SmoothStep}
                    onLoad={this.onLoad}
                    onElementClick={(event, element) => this.handleNodeClick(event, element as FlowGraphNode)}
                    nodeTypes={nodeTypes}
                />
                <Controls />
            </ReactFlowProvider>

            {/* {this.createNodeTooltip()} */}
        </div>
    }

    public render() {
        return this.createReactFlowGraph();
    }

}

export default QueryPlanViewer;
