import styles from '../../../style/queryplan.module.css';
import React from 'react';
import _ from 'lodash';
import { FlowGraphElements, FlowGraphNode } from './query_plan_wrapper';
import ReactFlow, { ConnectionLineType, Controls, ReactFlowProvider } from 'react-flow-renderer';

interface State{
    isNodeHover: true,
    tooltipPositionX: string,
    tooltipPositionY: string,
}

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

    handleNodeMouseEnter(event: any) {
        //TODO on catch mouse hover event
        // console.log(event)
    }

    handleNodeMouseLeave(event: any){

    }

    createNodeTooltip(){
        
    }

    handleNodeClick(event: React.MouseEvent, element: FlowGraphNode) {
        this.props.handleOperatorSelection(element.id);
    }

    onLoad(reactFlowInstance: any) {
        //Fit graph to view after load
        reactFlowInstance.fitView();
    }

    createReactFlowGraph() {

        console.log(this.props.graphElements);

        return <div
            className={styles.reactFlowGraph}
        >
            <ReactFlowProvider>
                <ReactFlow
                    elements={this.props.graphElements}
                    minZoom={0.1}
                    maxZoom={3}
                    onNodeMouseEnter={this.handleNodeMouseEnter}
                    onNodeMouseLeave={this.handleNodeMouseLeave}
                    nodesConnectable={false}
                    nodesDraggable={true}
                    // onConnect={this.createEdges}
                    // onElementsRemove={onElementsRemove}
                    connectionLineType={ConnectionLineType.SmoothStep}
                    onLoad={this.onLoad}
                    onElementClick={(event, element) => this.handleNodeClick(event, element as FlowGraphNode)}
                />
                <Controls />
            </ReactFlowProvider>

            {this.createNodeTooltip()}
        </div>
    }

    public render() {
        return this.createReactFlowGraph();
    }

}

export default QueryPlanViewer;
