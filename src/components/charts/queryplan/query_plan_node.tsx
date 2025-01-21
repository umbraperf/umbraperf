import { Tooltip } from '@material-ui/core';
import CSS from 'csstype';
import React, { memo, useContext } from 'react';
import { Handle, Position } from 'react-flow-renderer';
import { ctx } from '../../../app_context';
import * as styles from '../../../style/queryplan.module.css';
import QueryPlanNodeTooltipContent, { QueryplanNodeTooltipData } from './query_plan_node_tooltip_content';

export type QueryplanNodeData = {
    label: string,
    tooltipData: QueryplanNodeTooltipData,
}

interface QueryplanNodeProps {
    id: string,
    data: QueryplanNodeData,
    type: string,
    selected: boolean,
    sourcePosition: Position,
    targetPosition: Position,
}

export default memo(function QueryplanNode(props: QueryplanNodeProps) {

    const handleStyle = (handlerType: "source" | "target"): CSS.Properties => {
        return {
            background: context!.accentBlack,
            visibility: ((handlerType === "source" && props.id.includes("root")) || (handlerType === "target" && (props.id.includes("tablescan") || props.id.includes("groupbyscan")))) ? "hidden" : "visible",
        }
    }

    const context = useContext(ctx);

    const createNodeContent = () => {
        return <div
            className={styles.queryplanNodeBody}
        >
            {props.data.label.length > 15 ? props.data.label.substring(0, 14) + "..." : props.data.label}
        </div>
    }

    return (
        <>
            <Tooltip
                classes={{ tooltip: styles.queryplanNodeTooltip }}
                title={<React.Fragment>
                    <QueryPlanNodeTooltipContent
                        operatorName={props.data.label}
                        operatorId={props.id}
                        tooltipData={props.data.tooltipData}
                    />
                </React.Fragment>
                }
                placement="top"
            >
                {createNodeContent()}
            </Tooltip>

            <Handle
                type="target"
                position={props.targetPosition}
                style={handleStyle("target")}
                isConnectable={false}
            />
            <Handle
                type="source"
                position={props.sourcePosition}
                style={handleStyle("source")}
                isConnectable={false}
            />
        </>
    );
});