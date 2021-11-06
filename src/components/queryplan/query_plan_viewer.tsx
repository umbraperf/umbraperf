import * as model from '../../model';
import * as Context from '../../app_context';
import styles from '../../style/queryplan.module.css';
import Spinner from '../utils/spinner';
import React from 'react';
import { connect } from 'react-redux';
import { Redirect } from 'react-router-dom';
import { createRef } from 'react';
import _ from 'lodash';
import WarningIcon from '@material-ui/icons/Warning';
import Typography from '@material-ui/core/Typography';
import DagreGraph from 'dagre-d3-react'


interface Props {
    appContext: Context.IAppContext;
    csvParsingFinished: boolean;
    queryPlan: object | undefined;
    setCurrentChart: (newCurrentChart: string) => void;
}

interface State {
    width: number,
    loading: boolean,
    queryplan: JSX.Element | undefined,
}


class QueryPlanViewer extends React.Component<Props, State> {

    elementWrapper = createRef<HTMLDivElement>();


    constructor(props: Props) {
        super(props);
        this.state = {
            width: 0,
            loading: true,
            queryplan: undefined,
        };

    }

    shouldComponentUpdate(nextProps: Props, nextState: State) {
        return true;
    }

    componentDidUpdate(prevProps: Props): void {
        if (this.props.queryPlan !== prevProps.queryPlan) {
            this.createQueryPlan();
        }
    }


    componentDidMount() {

        this.setState((state, props) => ({
            ...state,
            width: this.elementWrapper.current!.offsetWidth,
        }));

        if (this.props.csvParsingFinished) {
            this.props.setCurrentChart(model.ChartType.QUERY_PLAN);

            addEventListener('resize', (event) => {
                this.resizeListener();
            });
        }
    }

    resizeListener() {
        if (!this.elementWrapper) return;

        const child = this.elementWrapper.current;
        if (child) {
            const newWidth = child.offsetWidth;

            child.style.display = 'none';

            this.setState((state, props) => ({
                ...state,
                width: newWidth,
            }));

            child.style.display = 'block';
        }

    }

    isComponentLoading(): boolean {
        if (!this.props.queryPlan) {
            return true;
        } else {
            return false;
        }
    }

    public render() {

        return <div ref={this.elementWrapper} className={styles.elementWrapper}>
            {this.isComponentLoading()
                ? <Spinner />
                : <div className={styles.queryplanContainer}>
                    {this.state.queryplan}
                </div>
            }
        </div>;
    }

    createQueryPlan() {

        const queryPlanJson = this.props.queryPlan;

        let queryplanContent: JSX.Element;

        if (undefined === queryPlanJson || queryPlanJson.hasOwnProperty('error')) {
            queryplanContent = this.createNoQueryPlanWarning();
        } else {
            queryplanContent = this.createDagrePlan(queryPlanJson);
        }

        this.setState((state, props) => ({
            ...state,
            loading: false,
            queryplan: queryplanContent,
        }));
    }

    createDagrePlan(queryplanJson: object) {

        console.log(queryplanJson)


        const rootNode = {
            label: "RESULT",
            id: "root",
            child: queryplanJson,
        }
        const dagreData = this.createDagreNodesLinks(rootNode);

        let dagreDatatest = {
            nodes: [{ label: 'a', id: '1', class: styles.dagreNode }, { label: 'b', id: '2', class: styles.dagreNode }],
            links: [{
                source: '1', target: '2', class: styles.dagreEdge, config: {
                    arrowheadStyle: 'display: none',
                }
            }]
        }

        return <DagreGraph
            className={styles.dagreGraph}
            nodes={dagreDatatest.nodes}
            links={dagreDatatest.links}
            config={{
                rankdir: 'LR',
                align: 'UL',
                ranker: 'tight-tree'
            }}
            animate={1000}
            shape='circle'
            fitBoundaries={true}
            zoomable={true}
        // onNodeClick={e => console.log(e)}
        // onRelationshipClick={e => console.log(e)}
        />
    }

    createDagreNodesLinks(planElement: object) {

    }

    createNode(label: string, id: string, children: "input" | "left" | "right") {
        return {
            label,
            id,
            children,
        }
    }

    createNoQueryPlanWarning() {
        return <div className={styles.warningContainer}>
            <WarningIcon
                fontSize="large"
                color="secondary"
            />
            <Typography
                style={{ color: this.props.appContext.tertiaryColor }}
                variant="caption"
            >
                A Problem occured reading the query plan.
            </Typography>
        </div>
    }
}


const mapStateToProps = (state: model.AppState) => ({
    csvParsingFinished: state.csvParsingFinished,
    queryPlan: state.queryPlan,
});

const mapDispatchToProps = (dispatch: model.Dispatch) => ({
    setCurrentChart: (newCurrentChart: string) => dispatch({
        type: model.StateMutationType.SET_CURRENTCHART,
        data: newCurrentChart,
    }),
});


export default connect(mapStateToProps, mapDispatchToProps)(Context.withAppContext(QueryPlanViewer));
