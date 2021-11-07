import styles from '../../style/queryplan.module.css';
import React from 'react';
import _ from 'lodash';
import DagreGraph from 'dagre-d3-react';
import { DagreNode, DagreEdge } from './query_plan_wrapper';


interface Props {
    height: number;
    width: number;
    nodes: Array<DagreNode>;
    edges: Array<DagreEdge>;
    handleNodeClick: (event: { d3norde: object, original: DagreNode }) => void;
}

class QueryPlanViewer extends React.Component<Props, {}> {

    constructor(props: Props) {
        super(props);
    }

    public render() {

        return <DagreGraph
            className={styles.dagreGraph}
            nodes={this.props.nodes}
            links={this.props.edges}
            config={{
                rankdir: 'LR',
                ranker: 'network-simplex',
                // height: "100px",
                // width: "500px",
            }}
            // height={"" + this.props.height}
            // width={"" + this.props.width}
            animate={500}
            shape='rect'
            fitBoundaries={true}
            zoomable={true}
            onNodeClick={(event: { d3norde: object, original: DagreNode }) => this.props.handleNodeClick(event)}
        // onRelationshipClick={e => console.log(e)}
        />
    }

}

export default QueryPlanViewer;
