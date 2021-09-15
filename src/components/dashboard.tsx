import * as model from '../model';
import React from "react";
import _ from "lodash";
import styles from '../style/dashboard.module.css';
import { WidthProvider, Responsive } from 'react-grid-layout';
import HighlightOffIcon from '@material-ui/icons/HighlightOff';



interface State {
    items: Array<IItemElement>,
    layout?: Array<ILayoutElement>;
    breakpoints?: { lg: number, md: number, sm: number, xs: number, xxs: number };
    cols?: { lg: number, md: number, sm: number, xs: number, xxs: number };
    newCounter: number;

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

interface IItemElement {
    i: string,
    x: number,
    y: number,
    w: number,
    h: number,
    add?: boolean,
}

const originalItems: Array<IItemElement> = [0, 1, 2, 3, 4].map(function (i, key, list) {
    return {
        i: i.toString(),
        x: i * 2,
        y: 0,
        w: 2,
        h: 2,
        add: "" + i === (list.length - 1).toString(),
    };
});


//a HOC WidthProvider can be used to automatically determine width upon initialization and window resize events:
const ResponsiveGridLayout = WidthProvider(Responsive);

class Dashboard extends React.Component<any, State> {

    static defaultProps = {
        cols: { lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 },
        rowHeight: 100,
        margin: [30, 20],

    };

    constructor(props: any) {
        super(props);
        this.state = {
            items: originalItems,
            newCounter: 0
        };

        this.onAddItem = this.onAddItem.bind(this);
        this.onBreakpointChange = this.onBreakpointChange.bind(this);
        this.onLayoutChange = this.onLayoutChange.bind(this);
    }


    componentDidMount(): void {
    }

    componentDidUpdate(prevProps: any): void {

    }

    stopEventPropagation = (event: any) => {
        event.stopPropagation();
    };

    render() {
        return (
            <div>
                <button onClick={this.onAddItem}>Add Item</button>
                <ResponsiveGridLayout
                    className={`layout ${styles.gridBoxesContainer}`}
                    onLayoutChange={this.onLayoutChange}
                    onBreakpointChange={this.onBreakpointChange}
                    {...this.props}
                >

                    {
                        _.map(this.state.items, el => this.createWidgetElement(el))
                    }

                </ResponsiveGridLayout>

            </div>

        );
    }

    onBreakpointChange(breakpoint: any, cols: any) {
        this.setState({
            breakpoints: breakpoint,
            cols: cols
        });
    }

    onLayoutChange(layout: any) {
        /*         if (layout) {
                    this.props.onLayoutChange(layout);
                    this.setState({ layout: layout });
                } */
    }

    onAddItem() {
        // Add a new item. It must have a unique key!
        this.setState({
            // Add a new item. It must have a unique key!
            items: this.state.items.concat({
                i: "n" + this.state.newCounter,
                x: (this.state.items.length * 2) % (this.state.cols as any || 12),
                y: Infinity, // puts it at the bottom 
                w: 2,
                h: 2
            }),
            // Increment the counter to ensure key is always unique.
            newCounter: this.state.newCounter + 1
        });
    }

    onRemoveItem(i: string) {
        this.setState({ items: _.reject(this.state.items, { i: i }) });
    }

    createWidgetElement(el: any) {

        const i = el.add ? '+' : el.i;
        return (
            <div
                key={i}
/*                 No layout for parent provided -> use data-grid prop for child elements
 */             data-grid={el}
                className={`widget ${styles.gridBox}`}
            >
                {el.add ?
                    <span
                        className={`add text ${styles.addText}`}
                        onMouseDown={this.stopEventPropagation}
                        onTouchStart={this.stopEventPropagation}
                        onClick={this.onAddItem}
                        title="Add a visualization. "
                    >
                        ADD
                    </span>
                    :
                    <span className={`text ${styles.text}`}>
                        {this.createRemoveElement(el)}
                        {i}
                    </span>}
            </div>
        );

    }

    createRemoveElement(el: any) {

        const i = el.add ? "+" : el.i;

        return (
            <div key={i} data-grid={el}>
                <span
                    className={styles.widgetRemove}
                    onMouseDown={this.stopEventPropagation}
                    onTouchStart={this.stopEventPropagation}
                    onClick={this.onRemoveItem.bind(this, i)}

                >
                    <HighlightOffIcon></HighlightOffIcon>
                </span>
            </div>
        );
    }

}


export default Dashboard;

