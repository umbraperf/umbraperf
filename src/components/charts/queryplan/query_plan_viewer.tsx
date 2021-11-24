import styles from '../../../style/queryplan.module.css';
import React from 'react';
import _ from 'lodash';
import DagreGraph from 'dagre-d3-react';
import dagre from 'dagre';
import { FlowGraphElements, PlanNode, PlanEdge } from './query_plan_wrapper';
import { elementDragControls } from 'framer-motion/types/gestures/drag/VisualElementDragControls';
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

    createReactFlowGraph() {

        const layoutedElements = this.props.graphElements;

        return <div className={styles.dagreGraph}
        >
            <ReactFlowProvider>
                <ReactFlow
                    elements={layoutedElements}
                    // onConnect={this.createEdges}
                    // onElementsRemove={onElementsRemove}
                    connectionLineType={ConnectionLineType.SmoothStep}
                />
            </ReactFlowProvider>
        </div>
    }

    public render() {

        return this.createReactFlowGraph();
        //     return <DagreGraph
        //         className={styles.dagreGraph}
        //         nodes={this.props.nodes}
        //         links={this.props.edges}
        //         config={{
        //             rankdir: this.props.height > this.props.width ? 'TD' : 'LR',
        //             ranker: 'network-simplex',
        //             // height: "100px",
        //             // width: "500px",
        //         }}
        //         // height={"" + this.props.height}
        //         // width={"" + this.props.width}
        //         animate={500}
        //         shape='rect'
        //         fitBoundaries={true}
        //         zoomable={true}
        //         onNodeClick={(event: { d3norde: object, original: DagreNode }) => this.props.handleNodeClick(event)}
        //     // onRelationshipClick={e => console.log(e)}
        //     />
    }

}

export default QueryPlanViewer;
