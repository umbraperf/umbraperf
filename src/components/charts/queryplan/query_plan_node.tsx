import { styled, Theme, Tooltip, TooltipProps, withStyles } from '@material-ui/core';
import React, { memo, useContext } from 'react';
import { Handle, Position } from 'react-flow-renderer';
import { ctx } from '../../../app_context';
import CSS from 'csstype';
import styles from '../../../style/queryplan.module.css';
import QueryPlanNodeTooltipContent from './query_plan_node_tooltip_content';

export type QueryplanNodeData = {
    label: string,
}

interface QueryplanNodeProps {
    id: string,
    data: QueryplanNodeData,
    type: string,
    selected: boolean,
    sourcePosition: Position,
    targetPosition: Position,
}

//Adjust material UI tooltip
const HtmlTooltip = withStyles((theme: Theme) => ({
    tooltip: {
        backgroundColor: '#f5f5f9',
        color: 'rgba(0, 0, 0, 0.87)',
        maxWidth: 220,
        fontSize: theme.typography.pxToRem(12),
        border: '1px solid #dadde9',
    },
}))(Tooltip);


export default memo(function QueryplanNode(props: QueryplanNodeProps) {

    const handleStyle = (handlerType: "source" | "target"): CSS.Properties => {
        return {
            background: context!.accentBlack,
            visibility: ((handlerType === "source" && props.id.includes("root")) || (handlerType === "target" && props.id.includes("tablescan"))) ? "hidden" : "visible",
        }
    }

    const context = useContext(ctx);

    const createNodeContent = () => {
        return <div
            className={styles.queryplanNodeBody}
        >
            {props.data.label}
        </div>
    }

    return (
        <>
            <HtmlTooltip
                title={<React.Fragment>
                    <QueryPlanNodeTooltipContent
                        operatorName={props.data.label}
                    />
                </React.Fragment>
                }
                placement="top"
            >
                {createNodeContent()}
            </HtmlTooltip>

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