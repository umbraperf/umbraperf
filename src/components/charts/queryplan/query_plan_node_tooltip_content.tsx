import * as Context from '../../../app_context';
import styles from '../../../style/queryplan.module.css';
import React from 'react';
import { Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from '@material-ui/core';



interface Props {
    appContext: Context.IAppContext;
    operatorName: string,
}

class QueryPlanNodeTooltipContent extends React.Component<Props, {}> {


    constructor(props: Props) {
        super(props);
    }

    createContentTable() {

        function DenseTable() {

            function createData(lineNumber: number, uirLine: string, eventOccurrence: string) {
                return { lineNumber, uirLine, eventOccurrence };
            }

            let tableRows = [];
            for (let i = 0; i < 5; i++) {
                tableRows.push(createData(i + 1, "testXXXtest", "xx%"))
            }

            return (
                <Paper className={styles.queryplanNodeTooltipTableContainer}>

                    {/* <TableContainer className={styles.queryplanNodeTooltipTableContainer} component={Paper}> */}
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
                                    <TableCell className={styles.queryplanNodeTooltipTableCellContent} width="5%" component="td" align="right">{row.lineNumber}</TableCell>
                                    <TableCell className={styles.queryplanNodeTooltipTableCellContent} width="85%" component="th" align="left" scope="row">
                                        {row.uirLine}
                                    </TableCell>
                                    <TableCell className={styles.queryplanNodeTooltipTableCellContent} width="10%" component="td" align="right">{row.eventOccurrence}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </Paper>
            );
        }


        return DenseTable();
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
