import * as Context from '../../../app_context';
import styles from '../../../style/queryplan.module.css';
import React from 'react';
import { Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from '@material-ui/core';

export type QueryplanNodeTooltipData = {
    uirLines: Array<string>,
    uirLineNumber: Array<number>,
    eventOccurrences: Array<number>,
    totalEventOccurrence: number,
}

interface Props {
    appContext: Context.IAppContext;
    operatorName: string,
    tooltipData: QueryplanNodeTooltipData,
}

class QueryPlanNodeTooltipContent extends React.Component<Props, {}> {


    constructor(props: Props) {
        super(props);
    }

    createContentTable() {

        function DenseTable(tooltipData: QueryplanNodeTooltipData) {

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
                tableRows.push(createData(tooltipData.uirLineNumber[i], truncateUirLine(tooltipData.uirLines[i], 60), tooltipData.eventOccurrences[i] + "%"))
            }

            return (
                <Paper>
                    <Table
                        size="small"
                        aria-label="a dense table">
                        <TableHead>
                            <TableRow>
                                <TableCell className={styles.queryplanNodeTooltipTableCellHead} align="right">No.</TableCell>
                                <TableCell className={styles.queryplanNodeTooltipTableCellHead} align="left">UIR Line</TableCell>
                                <TableCell className={styles.queryplanNodeTooltipTableCellHead} align="right">Freq.</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {tableRows.map((row) => (
                                <TableRow key={row.lineNumber}>
                                    <TableCell className={styles.queryplanNodeTooltipTableCell} component="td" align="right">
                                        <div className={styles.queryplanNodeTooltipTableCellContentUirNumber}>
                                            {row.lineNumber}
                                        </div>
                                    </TableCell>
                                    <TableCell className={styles.queryplanNodeTooltipTableCell} component="th" align="left" scope="row">
                                        <div className={styles.queryplanNodeTooltipTableCellContentUirLine}>
                                            {row.uirLine}
                                        </div>
                                    </TableCell>
                                    <TableCell className={styles.queryplanNodeTooltipTableCell} component="td" align="right">
                                        <div className={styles.queryplanNodeTooltipTableCellContentUirFreq}>
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

    createTotalSumLine() {
        return <Typography className={styles.queryplanNodeTooltipSubtitle} variant="body2">{`Total Frequency: ${this.props.tooltipData.totalEventOccurrence}%`}</Typography>
    }

    createNodeTooltip() {
        return <div>
            {/* <Typography color="secondary">{this.props.operatorName}</Typography>
            <Typography className={styles.queryplanNodeTooltipSubtitle} variant="caption">{`Most expensive UIR lines caused by ${this.props.operatorName}:`}</Typography> */}

            {this.createContentTable()}
            {this.createTotalSumLine()}
        </div >
    }

    public render() {
        return this.createNodeTooltip();
    }

}

export default (Context.withAppContext(QueryPlanNodeTooltipContent));
