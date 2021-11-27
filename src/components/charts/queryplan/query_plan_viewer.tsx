import styles from '../../../style/queryplan.module.css';
import React from 'react';
import _ from 'lodash';
import { FlowGraphElements, FlowGraphNode } from './query_plan_wrapper';
import ReactFlow, { ConnectionLineType, Controls, ReactFlowProvider } from 'react-flow-renderer';
import QueryplanNode from './query_plan_node';
import CSS from 'csstype';


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
    }

    handleNodeClick(event: React.MouseEvent, element: FlowGraphNode) {
        this.props.handleOperatorSelection(element.id);
    }

    onLoad(reactFlowInstance: any) {
        //Fit graph to view after load
        reactFlowInstance.fitView();
    }

    createReactFlowGraph() {

        const controlSytle: CSS.Properties = {
            // position: 'absolute',
            // top: '-120px',
        }

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
                >
                    <Controls

                        style={controlSytle}
                    />
                </ReactFlow>


            </ReactFlowProvider>

            {/* {this.createNodeTooltip()} */}
        </div>
    }

    public render() {
        return this.createReactFlowGraph();
    }

}

export default QueryPlanViewer;
