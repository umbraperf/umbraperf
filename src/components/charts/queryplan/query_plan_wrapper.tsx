import * as model from '../../../model';
import * as Controller from '../../../controller';
import * as Context from '../../../app_context';
import styles from '../../../style/queryplan.module.css';
import Spinner from '../../utils/spinner';
import React from 'react';
import { connect } from 'react-redux';
import { createRef } from 'react';
import _ from 'lodash';
import WarningIcon from '@material-ui/icons/Warning';
import Typography from '@material-ui/core/Typography';
import QueryPlanViewer from './query_plan_viewer';


export interface QueryPlanWrapperAppstateProps {
    appContext: Context.IAppContext;
    csvParsingFinished: boolean;
    queryPlan: object | undefined;
    currentView: model.ViewType;
    currentOperator: Array<string> | "All";
    operators: Array<string> | undefined;
    setCurrentChart: (newCurrentChart: model.ChartType) => void;
}

interface State {
    height: number,
    width: number,
    loading: boolean,
    renderedDagrePlan: JSX.Element | undefined,
    renderDagrePlan: boolean,
}

export type DagreNode = {
    label: string
    id: string,
    parent: string,
    class: string,
    config?: object,
}

export type DagreEdge = {
    source: string,
    target: string,
    class: string,
    config: object,
}

type Props = QueryPlanWrapperAppstateProps & model.IQueryPlanProps;

class QueryPlanWrapper extends React.Component<Props, State> {

    graphContainer = createRef<HTMLDivElement>();

    constructor(props: Props) {
        super(props);
        this.state = {
            height: 0,
            width: 0,
            loading: true,
            renderedDagrePlan: undefined,
            renderDagrePlan: true,
        };

        this.handleNodeClick = this.handleNodeClick.bind(this);
    }

    componentDidUpdate(prevProps: Props, prevState: State): void {
        if (Controller.queryPlanRerenderNeeded(this.props, prevProps, this.state.width, prevState.width)) {
            this.setState((state, props) => ({
                ...state,
                renderedDagrePlan: undefined,
            }));
            this.createQueryPlan();
        }
    }


    componentDidMount() {

        this.setState((state, props) => ({
            ...state,
            width: this.graphContainer.current!.offsetWidth,
            height: this.graphContainer.current!.offsetHeight,
        }));

        this.props.setCurrentChart(model.ChartType.QUERY_PLAN);

        addEventListener('resize', (event) => {
            this.resizeListener();
        });


    }

    resizeListener() {
        if (!this.graphContainer) return;

        const child = this.graphContainer.current;
        if (child) {
            const newWidth = child.offsetWidth;

            child.style.display = 'none';

            let resizingTimeoutId = undefined;
            clearTimeout(resizingTimeoutId);
            resizingTimeoutId = setTimeout(() => {
                this.setState((state, props) => ({
                    ...state,
                    width: newWidth,
                    //  renderedDagrePlan: undefined,
                }));
            }, 500);

            child.style.display = 'flex';
        }

    }

    isComponentLoading(): boolean {
        if (!this.props.queryPlan || !this.props.operators) {
            return true;
        } else {
            return false;
        }
    }

    public render() {

        return <div ref={this.graphContainer} className={styles.elementWrapper}>
            {this.isComponentLoading()
                ? <Spinner />
                : <div id="queryplanContainer" className={styles.queryplanContainer}>
                    <div className={styles.queryplanContainerTitle}>Query Plan</div>
                    {this.state.renderedDagrePlan}
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
            queryplanContent = this.prepareDagrePlan(queryPlanJson);
        }
        this.setState((state, props) => ({
            ...state,
            loading: false,
            renderedDagrePlan: queryplanContent,
        }));
    }

    prepareDagrePlan(queryplanJson: object) {

        const rootNode = {
            label: "RESULT",
            id: "root",
            child: queryplanJson,
        }
        const dagreData = this.createDagreNodesLinks(rootNode);

        const dagreGraph = React.createElement(QueryPlanViewer, {
            height: this.state.height,
            width: this.state.width,
            nodes: dagreData.nodes,
            edges: dagreData.links,
            handleNodeClick: this.handleNodeClick,
        } as any);

        return dagreGraph;
    }


    handleNodeClick(event: { d3norde: object, original: DagreNode }) {
        //TODO add pipeline, make pipeline in function in controller obliq
        if (this.props.operators!.includes(event.original.id)) {
            //Only trigger operator selection if operator is in measurement data
            Controller.handleOperatorSelection(event.original.id);
        }
    }

    createDagreNodesLinks(root: Partial<DagreNode> & { child: object }) {

        let dagreData = {
            nodes: new Array<DagreNode>(),
            links: new Array<DagreEdge>()
        }

        const nodeColorScale = model.chartConfiguration.getOperatorColorScheme(this.props.operators!.length, false);

        const nodeClass = (nodeId: string) => {
            if (nodeId === "root") {
                return `${styles.dagreNode} ${styles.dagreRootNode}`;
            } else if (!this.props.operators!.includes(nodeId)) {
                //node does not appear in measurement data
                return `${styles.dagreNode} ${styles.dagreUnavailableNode}`;
            } else if (this.props.currentOperator === "All" || this.props.currentOperator.includes(nodeId)) {
                return `${styles.dagreNode} ${styles.dagreActiveNode}`;
            } else {
                return `${styles.dagreNode} ${styles.dagreInactiveNode}`;
            }
        }

        const nodeColor = (nodeId: string) => {
            if (nodeId === "root") {
                return this.props.appContext.accentBlack;
            } else if (!this.props.operators!.includes(nodeId)) {
                //node does not appear in measurement data
                return this.props.appContext.tertiaryColor;
            } else if (this.props.currentOperator === "All" || this.props.currentOperator.includes(nodeId)) {
                return nodeColorScale[this.props.operators!.indexOf(nodeId)];
            } else {
                return this.props.appContext.tertiaryColor;
            }
        }

        const nodeCornerRadius = "rx: 12; ry: 12";

        dagreData.nodes.push({ label: root.label!, id: root.id!, parent: "", class: nodeClass(root.id!), config: { style: `fill: ${nodeColor(root.id!)}; ${nodeCornerRadius}` } })
        fillGraph(root.child, root.id!)

        function fillGraph(currentPlanElement: any, parent: string) {

            dagreData.nodes.push({ label: currentPlanElement.operator, id: currentPlanElement.operator, parent: parent, class: nodeClass(currentPlanElement.operator), config: { style: `fill: ${nodeColor(currentPlanElement.operator)}; ${nodeCornerRadius}` } });
            dagreData.links.push({ source: parent, target: currentPlanElement.operator, class: styles.dagreEdge, config: { arrowheadStyle: 'display: none' } });

            ["input", "left", "right"].forEach(childType => {
                if (currentPlanElement.hasOwnProperty(childType)) {
                    fillGraph(currentPlanElement[childType], currentPlanElement.operator);
                }
            });
        }

        return dagreData;

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
    currentView: state.currentView,
    currentOperator: state.currentOperator,
    operators: state.operators,
});

const mapDispatchToProps = (dispatch: model.Dispatch) => ({
    setCurrentChart: (newCurrentChart: model.ChartType) => dispatch({
        type: model.StateMutationType.SET_CURRENTCHART,
        data: newCurrentChart,
    }),
});


export default connect(mapStateToProps, mapDispatchToProps)(Context.withAppContext(QueryPlanWrapper));
