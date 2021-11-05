import * as model from '../../model';
import * as Context from '../../app_context';
import Spinner from '../utils/spinner';
import React from 'react';
import { connect } from 'react-redux';
import { Redirect } from 'react-router-dom';
import { createRef } from 'react';
import _ from 'lodash';
import WarningIcon from '@material-ui/icons/Warning';
import Typography from '@material-ui/core/Typography';


interface Props {
    appContext: Context.IAppContext;
    csvParsingFinished: boolean;
    queryPlan: object | undefined;
    setCurrentChart: (newCurrentChart: string) => void;
}

interface State {
    width: number,
}


class QueryPlanViewer extends React.Component<Props, State> {

    elementWrapper = createRef<HTMLDivElement>();


    constructor(props: Props) {
        super(props);
        this.state = {
            width: 0,
        };

    }

    shouldComponentUpdate(nextProps: Props, nextState: State) {
        return true;
    }

    componentDidUpdate(prevProps: Props): void {
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

        if (!this.props.csvParsingFinished) {
            return <Redirect to={"/upload"} />
        }

        return <div ref={this.elementWrapper} style={{ position: "relative", display: "flex", height: "100%", justifyContent: "center", alignItems: "center" }}>
            {this.isComponentLoading()
                ? <Spinner />
                : <div className={"queryplanContainer"} >
                    {this.createDagreQueryPlan()}
                </div>
            }
        </div>;
    }

    createDagreQueryPlan() {

        const queryPlanJson = this.props.queryPlan;

        if (undefined === queryPlanJson || queryPlanJson.hasOwnProperty('error')) {
            const noQueryplanWarning = this.createNoQueryPlanWarning();
            return noQueryplanWarning;
        } else {
            return JSON.stringify(queryPlanJson);
        }
    }

    createNoQueryPlanWarning() {
        return <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center" }}>
            <WarningIcon
                fontSize="large"
                color="secondary"
            />
            <Typography
                style={{color: this.props.appContext.tertiaryColor}}
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
