import styles from '../../../style/queryplan.module.css';
import React from 'react';
import { Typography } from '@material-ui/core';



interface Props {

}

class QueryPlanNodeTooltip extends React.Component<Props, {}> {


    constructor(props: Props) {
        super(props);
    }


    createNodeTooltip() {
        return <div>
            <Typography color="inherit">Tooltip with HTML</Typography>
            <em>{"And here's"}</em> <b>{'some'}</b> <u>{'amazing content'}</u>.{' '}
            {"It's very engaging. Right?"}
        </div >
    }

    public render() {
        return this.createNodeTooltip();
    }

}

export default QueryPlanNodeTooltip;
