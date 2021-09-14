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
    layout: { lg: Array<ILayoutElement> };
    gridData: { w: number, h: number, x: number, y: number };
    breakpoints: { lg: number, md: number, sm: number, xs: number, xxs: number };
    cols: { lg: number, md: number, sm: number, xs: number, xxs: number };
    rowHeight: number;
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
            newCounter: 0
        };

        this.onAddItem = this.onAddItem.bind(this);

    }


    componentDidMount(): void {
    }

    componentDidUpdate(prevProps: Props): void {

    }

    render() {
        return (
            <div>
                <button onClick={this.onAddItem}>Add Item</button>
                <ResponsiveGridLayout
                    className={`layout ${styles.gridBoxesContainer}`}
                    layouts={this.state.layout}
                    breakpoints={this.state.breakpoints}
                    cols={this.state.cols}
                    rowHeight={this.state.rowHeight}
/*             onLayoutChange={onLayoutChange}
 */          >
                    {this.state.items.map((key, elem) => (
                        <div
                            key={key}
                            className={`widget ${styles.gridBox}`}
/*                         data-grid={this.state.gridData}
 */                    >
                            {this.createRemoveElement(elem)}
                            {/*                         <Widget
                            id={key}
/*                   onRemoveItem={onRemoveItem}
                   backgroundColor="#867ae9"
                        /> */}
                        </div>
                    ))}
                </ResponsiveGridLayout>

            </div>

        );
    }

    onAddItem() {
        this.setState({
            // Add a new item. It must have a unique key!
            items: this.state.items.concat("n" + this.state.newCounter),
            layout: {
                lg: this.state.layout.lg.concat({
                    i: "n" + this.state.newCounter,
                    x: (this.state.items.length * 2) % (this.state.cols as any || 12),
                    y: Infinity, // puts it at the bottom
                    w: 2,
                    h: 2
                } as ILayoutElement

                ),

            },
            // Increment the counter to ensure key is always unique.
            newCounter: this.state.newCounter + 1
        });
    }

    onRemoveItem(){
        //TODO 
    }

    createRemoveElement(el: any){

          const i = el.add ? "+" : el.i;
          
          return (
            <div key={i} data-grid={el}>
{/*               {el.add ? (
                <span
                  className="add text"
                  onClick={this.onAddItem}
                  title="You can add an item by clicking here, too."
                >
                  Add +
                </span>
              ) : (
                <span className="text">{i}</span>
              )} */}
              <span
                className={styles.widgetRemove}
                onClick={this.onRemoveItem.bind(this, i)}
              >
                x
              </span>
            </div>
          );
    }

}


export default withAppContext(Dashboard);

