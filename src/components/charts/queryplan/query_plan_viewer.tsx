import React from 'react';
import ReactFlow, { ConnectionLineType, Controls, NodeTypes } from 'react-flow-renderer';
import * as Controller from '../../../controller';
import * as styles from '../../../style/queryplan.module.css';
import QueryplanNode from './query_plan_node';
import { FlowGraphElements, FlowGraphNode } from './query_plan_wrapper';


interface Props {
    key: number; //trigers complete rerender for repositioning
    height: number;
    width: number;
    graphElements: FlowGraphElements,
}

class QueryPlanViewer extends React.Component<Props, {}> {


    constructor(props: Props) {
        super(props);
    }

    handleNodeClick(event: React.MouseEvent, element: FlowGraphNode) {
        Controller.handleOperatorSelection(element.id);
    }

    onLoad(reactFlowInstance: any) {
        //Fit graph to view after load
        reactFlowInstance.fitView();
    }

    createReactFlowGraph() {

        const nodeTypes: NodeTypes = {
            queryplanNode: QueryplanNode as NodeTypes['queryplanNode'],
        };

        return <div
            className={styles.reactFlowGraph}
        >
                <ReactFlow
                    elements={this.props.graphElements}
                    minZoom={0.1}
                    maxZoom={3}
                    // onNodeMouseEnter={(event, element) => this.handleNodeMouseEnter(event, element as FlowGraphNode)}
                    //onNodeMouseLeave={(event, element) => this.handleNodeMouseLeave(event, element as FlowGraphNode)}
                    nodesConnectable={false}
                    nodesDraggable={true}
                    connectionLineType={ConnectionLineType.SmoothStep}
                    onLoad={this.onLoad}
                    onElementClick={(event, element) => this.handleNodeClick(event, element as FlowGraphNode)}
                    nodeTypes={nodeTypes}
                >
                    <Controls className={styles.reactFlowControls} />
                </ReactFlow>
        </div>
    }

    public render() {
        return this.createReactFlowGraph();
    }

}

export default QueryPlanViewer;
