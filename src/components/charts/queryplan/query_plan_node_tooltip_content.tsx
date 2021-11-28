import * as Context from '../../../app_context';
import styles from '../../../style/queryplan.module.css';
import React from 'react';
import { Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from '@material-ui/core';

export type QueryplanNodeTooltip = {
    uirLines: Array<string>,
    uirLineNumber: Array<number>,
    eventOccurrences: Array<number>,
}

interface Props {
    appContext: Context.IAppContext;
    operatorName: string,
    tooltipData: QueryplanNodeTooltip,
}

class QueryPlanNodeTooltipContent extends React.Component<Props, {}> {


    constructor(props: Props) {
        super(props);
    }

    componentDidMount() {
        console.log(this.props.tooltipData);
    }

    createContentTable() {

        function DenseTable(tooltipData: QueryplanNodeTooltip) {

            function createData(lineNumber: number, uirLine: string, eventOccurrence: string) {
                return { lineNumber, uirLine, eventOccurrence };
            }

            function truncateUirLine(uirLine: string, length: number) {
                if (uirLine.length > length) {
                    return uirLine.substring(0, length - 1) + "...";
                } else {
                    return uirLine;
                }
            }

            let tableRows = [];
            for (let i = 0; i < 5; i++) {
                tableRows.push(createData(tooltipData.uirLineNumber[i], truncateUirLine(tooltipData.uirLines[i], 40), tooltipData.eventOccurrences[i] + "%"))
            }

            return (
                <Paper>
                    <Table
                        size="small"
                        aria-label="a dense table">
                        <TableHead>
                            <TableRow>
                                <TableCell className={styles.queryplanNodeTooltipTableCellHead} width="5%" align="right">No.</TableCell>
                                <TableCell className={styles.queryplanNodeTooltipTableCellHead} width="85%" align="left">UIR Line</TableCell>
                                <TableCell className={styles.queryplanNodeTooltipTableCellHead} width="10%" align="right">Freq.</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {tableRows.map((row) => (
                                <TableRow key={row.lineNumber}>
                                    <TableCell width="5%" component="td" align="right">
                                        <div className={styles.queryplanNodeTooltipTableCellContent}>
                                            {row.lineNumber}
                                        </div>
                                    </TableCell>
                                    <TableCell width="85%" component="th" align="left" scope="row">
                                        <div className={styles.queryplanNodeTooltipTableCellContent}>
                                            {row.uirLine}
                                        </div>
                                    </TableCell>
                                    <TableCell width="10%" component="td" align="right">
                                        <div className={styles.queryplanNodeTooltipTableCellContent}>
                                            {row.eventOccurrence}
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </Paper>
            );
        }


        return DenseTable(this.props.tooltipData);
    }

    createNodeTooltip() {
        return <div>
            <Typography color="secondary">{this.props.operatorName}</Typography>
            <Typography className={styles.queryplanNodeTooltipSubtitle} variant="caption">{`Most expensive UIR lines caused by ${this.props.operatorName}:`}</Typography>

            {this.createContentTable()}
        </div >
    }

    public render() {
        return this.createNodeTooltip();
    }

}

export default (Context.withAppContext(QueryPlanNodeTooltipContent));
