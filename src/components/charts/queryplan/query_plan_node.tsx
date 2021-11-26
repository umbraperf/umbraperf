import { Tooltip } from '@material-ui/core';
import { PinDropSharp } from '@material-ui/icons';
import { Data } from 'apache-arrow';
import React, { memo, useContext } from 'react';
import { Handle, Position } from 'react-flow-renderer';
import { ctx } from '../../../app_context';
import CSS from 'csstype';

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

    const context = useContext(ctx);

    const createNodeContent = () => {
        return <div
            className={"queryplanNode"}
            style={{width: '100%', height: '100%'}}
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
                style={{ background: context!.accentBlack }}
            />
            <Handle
                type="source"
                position={props.sourcePosition}
                style={{ background: context!.accentBlack }}
            />
        </>
    );
});