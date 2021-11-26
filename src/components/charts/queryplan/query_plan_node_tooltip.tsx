import styles from '../../../style/queryplan.module.css';
import React from 'react';
import { Tooltip } from '@material-ui/core';
import CSS from 'csstype';



interface Props {
    positionX: string,
    positionY: string,
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

    createNodeWithTooltip() {
        const tooltipStyle: CSS.Properties = {
            position: 'fixed',
            top: this.props.positionY,
            border: 'solid',
            borderWidth: '1px',
        }

        return <div
            className={"queryplanNodeTooltip"}
            style={tooltipStyle}
        >
            TEST TOOLTIP
        </div>
    }

    public render() {
        return this.createNodeWithTooltip();
    }

}

export default QueryPlanNodeTooltip;
