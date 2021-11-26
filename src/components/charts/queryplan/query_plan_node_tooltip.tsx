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

    createNodeWithTooltip() {
        const tooltipStyle: CSS.Properties = {
            position: 'fixed',
            top: "" + this.props.positionY,
            border: 'solid',
            borderWidth: '1px',
        }

        return <div
            className={styles.queryplanNodeTooltip}
            style={tooltipStyle}
        >
            {this.createTooltipContent()}
        </div>
    }

    public render() {
        return this.createNodeWithTooltip();
    }

}

export default QueryPlanNodeTooltip;
