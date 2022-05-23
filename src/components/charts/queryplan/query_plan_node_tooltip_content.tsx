import * as model from '../../../model';
import * as Context from '../../../app_context';
import styles from '../../../style/queryplan.module.css';
import React from 'react';
import { Paper, Table, TableBody, TableCell, TableHead, TableRow, Typography } from '@material-ui/core';

export type QueryplanNodeTooltipData = {
    uirLines: Array<string>,
    uirLineNumber: Array<number>,
    eventOccurrences: Array<number>,
    totalEventOccurrence: number,
    estimatedCardinality: number | undefined,
}

interface Props {
    appContext: Context.IAppContext;
    operatorName: string,
    operatorId: string,
    tooltipData: QueryplanNodeTooltipData,
}

class QueryPlanNodeTooltipContent extends React.Component<Props, {}> {


    constructor(props: Props) {
        super(props);
    }

    createContentTable() {

        const DenseTable = (tooltipData: QueryplanNodeTooltipData) => {

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
            if (tooltipData.uirLineNumber && tooltipData.uirLineNumber.length > 0) {
                let numberTableRows = tooltipData.uirLineNumber.length > 5 ? 5 : tooltipData.uirLineNumber.length;
                for (let i = 0; i < numberTableRows; i++) {
                    if (tooltipData.eventOccurrences[i] !== 0) {
                        tableRows.push(createData(tooltipData.uirLineNumber[i], truncateUirLine(tooltipData.uirLines[i], 65), tooltipData.eventOccurrences[i] + "%"));
                    }
                }
            }

            return (
                <Paper
                    className={styles.queryplanNodeTooltipTableBackground}
                >
                    {tableRows.length > 0 ?
                        (<Table
                            size="small"
                            aria-label="tooltip table">
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
                        </Table>)
                        :
                        (<Typography
                            className={styles.queryplanNodeTooltipEmptyTableMessage}
                            variant="subtitle2"
                        >
                            No occurrences in current selection.

                        </Typography>)
                    }

                </Paper>
            );
        }

        return DenseTable(this.props.tooltipData);
    }

    createNodeSubtitleLine() {
        return <div
            className={styles.queryplanNodeTooltipSubtitleContainer}
        >
            {this.props.tooltipData.estimatedCardinality && this.createEstimatedCardinalityLine()}
            {this.props.operatorId !== "root" && this.createTotalSumLine()}
        </div>
    }

    createTotalSumLine() {
        return <Typography
            className={styles.queryplanNodeTooltipSubtitleFrequency}
            variant="subtitle2"
        >
            Total Frequency: {this.props.tooltipData.totalEventOccurrence}%

        </Typography>
    }

    createEstimatedCardinalityLine() {
        return <Typography
            className={styles.queryplanNodeTooltipSubtitleCardinality}
            variant="subtitle2"
        >
            Estimated Cardinality: {model.chartConfiguration.nFormatter(this.props.tooltipData.estimatedCardinality!, 1)}

        </Typography>
    }

    createHeaderOperatorName() {
        const showOperatorId = () => {
            return this.props.operatorName === this.props.operatorId.replace(/\d+/g, '') ? "" : ` (${this.props.operatorId})`;
        }

        return <Typography
            className={styles.queryplanNodeTooltipHeader}
            variant="subtitle2"
        >
            {this.props.operatorName} {showOperatorId()}

        </Typography>
    }

    createNodeTooltip() {
        return <div>
            {this.createHeaderOperatorName()}
            {this.createContentTable()}
            {this.createNodeSubtitleLine()}
        </div >
    }

    public render() {
        return this.createNodeTooltip();
    }

}

export default (Context.withAppContext(QueryPlanNodeTooltipContent));
