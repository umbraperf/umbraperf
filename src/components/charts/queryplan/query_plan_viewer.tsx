import styles from '../../../style/queryplan.module.css';
import React from 'react';
import _ from 'lodash';
import { FlowGraphElements, PlanNode, PlanEdge } from './query_plan_wrapper';
import ReactFlow, { ConnectionLineType, ReactFlowProvider } from 'react-flow-renderer';


interface Props {
    key: number; //trigers complete rerender for repositioning
    height: number;
    width: number;
    // nodes: Array<PlanNode>;
    // edges: Array<PlanEdge>;
    graphElements: FlowGraphElements,
    handleNodeClick: (event: { d3norde: object, original: PlanNode }) => void;
}

class QueryPlanViewer extends React.Component<Props, {}> {


    constructor(props: Props) {
        super(props);
    }

    mousemove(event: any) {
        //TODO on catch mouse hover event
        console.log(event)
    }

    onLoad(reactFlowInstance: any) {
        //Fit graph to view after load
        reactFlowInstance.fitView();
    }

    createReactFlowGraph() {

        const layoutedElements = this.props.graphElements;

        return <div className={styles.dagreGraph}
        >
            <ReactFlowProvider>
                <ReactFlow
                    elements={layoutedElements}
                    onNodeMouseMove={this.mousemove}
                    onNodeMouseEnter={this.mousemove}
                    onNodeMouseLeave={this.mousemove}
                    onElementClick={undefined}
                    nodesConnectable={false}
                    nodesDraggable={true}
                    // onConnect={this.createEdges}
                    // onElementsRemove={onElementsRemove}
                    connectionLineType={ConnectionLineType.SmoothStep}
                    onLoad={this.onLoad}
                />
            </ReactFlowProvider>
        </div>
    }

    public render() {
        return this.createReactFlowGraph();
    }

}

export default QueryPlanViewer;
