import { Tooltip } from '@material-ui/core';
import React, { memo, useContext } from 'react';
import { Handle, Position } from 'react-flow-renderer';
import { ctx } from '../../../app_context';
import CSS from 'csstype';
import styles from '../../../style/queryplan.module.css';

export type QueryplanNodeData = {
    label: string,
    nodeStyle: CSS.Properties,
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
            <Tooltip title="Add" placement="top">
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