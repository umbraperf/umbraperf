import styles from '../../../style/queryplan.module.css';
import React from 'react';
import { Tooltip } from '@material-ui/core';
import CSS from 'csstype';



interface Props {
    positionX: number,
    positionY: number,
    nodeId: string,
    // key: number; //trigers complete rerender for repositioning
    // height: number;
    // width: number;
    // graphElements: FlowGraphElements,
    // handleOperatorSelection: (elementId: string) => void;
}

class QueryPlanNodeTooltip extends React.Component<Props, {}> {


    constructor(props: Props) {
        super(props);
    }

    createTooltipContent() {
        return <span>
            {this.props.nodeId}
        </span>
    }

    createNodeTooltip() {

        const tooltipStyle: CSS.Properties = {
            position: 'fixed',
            top: "" + this.props.positionY+"px",

        }

        console.log(this.props.positionX)
        console.log(tooltipStyle)
        return <div
            style={tooltipStyle}
            className={styles.queryplanNodeTooltip}
        >
            {this.createTooltipContent()}
        </div>
    }

    public render() {
        return this.createNodeTooltip();
    }

}

export default QueryPlanNodeTooltip;
