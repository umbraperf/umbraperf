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
                        className={styles.queryplanNodeTooltipTable}
                        size="small"
                        aria-label="a dense table">
                        <TableHead>
                            <TableRow>
                                <TableCell align="right">No.</TableCell>
                                <TableCell>UIR Line</TableCell>
                                <TableCell align="right">Freq.</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {tableRows.map((row) => (
                                <TableRow key={row.lineNumber}>
                                    <TableCell align="right">{row.lineNumber}</TableCell>
                                    <TableCell component="th" scope="row">
                                        {row.uirLine}
                                    </TableCell>
                                    <TableCell align="right">{row.eventOccurrence}</TableCell>
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
