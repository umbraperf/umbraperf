import * as Context from '../../../app_context';
import styles from '../../../style/queryplan.module.css';
import React from 'react';
import { Typography } from '@material-ui/core';



interface Props {
    appContext: Context.IAppContext;
    operatorName: string,
}

class QueryPlanNodeTooltipContent extends React.Component<Props, {}> {


    constructor(props: Props) {
        super(props);
    }

    createContentTable(){
        return <div></div>
    }

    createNodeTooltip() {
        return <div>
            <Typography color="secondary">{this.props.operatorName}</Typography>
            {`Most expensive UIR lines caused by ${this.props.operatorName}:`}
            {this.createContentTable()}
        </div >
    }

    public render() {
        return this.createNodeTooltip();
    }

}

export default (Context.withAppContext(QueryPlanNodeTooltipContent));
