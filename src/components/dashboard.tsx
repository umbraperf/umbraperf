import * as model from '../model';
import React from "react";
import { WidthProvider, Responsive } from "react-grid-layout";
import _ from "lodash";
import GridLayout from 'react-grid-layout';
import { IAppContext, withAppContext } from '../app_context';
import styles from '../style/dashboard.module.css';


interface Props {


}

interface State {
  

}


class Dashboard extends React.Component<Props, State> {

    static defaultProps = {

    };

    constructor(props: Props) {
        super(props);
        this.state = {

        };

    }


    componentDidMount(): void {
    }

    componentDidUpdate(prevProps: Props): void {

    }

    createLayout(){
      const layout = [
        {i: 'a', x: 0, y: 0, w: 1, h: 2, static: true},
        {i: 'b', x: 1, y: 0, w: 3, h: 2, minW: 2, maxW: 4},
        {i: 'c', x: 4, y: 0, w: 1, h: 2}
      ];
      return layout;
    }

    render() {
      return (
        <GridLayout className="layout" layout={this.createLayout()} cols={12} rowHeight={30} width={1200}>
          <div key="a">a</div>
          <div key="b">b</div>
          <div key="c">c</div>
        </GridLayout>
      );
      }

}


export default withAppContext(Dashboard);

