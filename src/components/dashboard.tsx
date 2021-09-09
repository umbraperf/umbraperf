import * as model from '../model';
import React from "react";
import _ from "lodash";
import GridLayout from 'react-grid-layout';
import { IAppContext, withAppContext } from '../app_context';
import styles from '../style/dashboard.module.css';
import { WidthProvider, Responsive } from 'react-grid-layout';




interface Props {


}

interface State {
    items: Array<string>;
    layout: {lg: Array<ILayoutElement>};
    gridData: { w: number, h: number, x: number, y: number };
    breakpoints: { lg: number, md: number, sm: number, xs: number, xxs: number };
    cols: { lg: number, md: number, sm: number, xs: number, xxs: number };
    rowHeight: number;

}

interface ILayoutElement {
    i: string,
    x: number,
    y: number,
    w: number,
    h: number,
    static?: boolean,
    minW?: number,
    maxW?: number,
    minh?: number,
    maxH?: number,
}

const originalItems: Array<string> = ["a", "b", "c", "d"];

const initialLayouts = {
    lg: [
      { i: "a", x: 0, y: 0, w: 1, h: 4 },
      { i: "b", x: 1, y: 0, w: 3, h: 4 },
      { i: "c", x: 4, y: 0, w: 1, h: 4 },
      { i: "d", x: 0, y: 4, w: 2, h: 4 }
    ]
  };

const gridData = { w: 3, h: 2, x: 0, y: Infinity };

//a HOC WidthProvider can be used to automatically determine width upon initialization and window resize events:
const ResponsiveGridLayout = WidthProvider(Responsive);

class Dashboard extends React.Component<Props, State> {

    static defaultProps = {

    };

    constructor(props: Props) {
        super(props);
        this.state = {
            items: originalItems,
            layout: initialLayouts,
            gridData: gridData,
            breakpoints: { lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 },
            cols: { lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 },
            rowHeight: 60,

        };

    }


    componentDidMount(): void {
    }

    componentDidUpdate(prevProps: Props): void {

    }

    render() {
        return (
            <ResponsiveGridLayout
            className={`layout ${styles.gridBoxesContainer}`}
            layouts={this.state.layout}
                breakpoints={this.state.breakpoints}
                cols={this.state.cols}
                rowHeight={this.state.rowHeight}
/*             onLayoutChange={onLayoutChange}
 */          >
                {this.state.items.map((key) => (
                    <div
                        key={key}
                        className={`widget ${styles.gridBox}`}
/*                         data-grid={this.state.gridData}
 */                    >
{/*                         <Widget
                            id={key}
/*                   onRemoveItem={onRemoveItem}
                   backgroundColor="#867ae9"
                        /> */}
                    </div>
                ))}
            </ResponsiveGridLayout>
        );
    }

}


export default withAppContext(Dashboard);

