import * as React from 'react';
import { ITopLevelComponent } from './app_config';
import { RequestController } from './controller/request_controller';

export interface IAppContext {
    controller: RequestController,
    primaryColor: string,
    secondaryColor: string,
    tertiaryColor: string,
    accentBlack: string,
    accentDarkGreen: string,
    accentDarkBlue: string,
    topLevelComponents: Array<ITopLevelComponent>,
}

export const ctx = React.createContext<IAppContext | null>(null);
export const AppContextProvider = ctx.Provider;
export const AppContextConsumer = ctx.Consumer;

export function withAppContext<
    ALL_PROPS extends { appContext?: IAppContext },
    RAW_PROPS = Pick<ALL_PROPS, Exclude<keyof ALL_PROPS, 'appContext'>>,
>(Component: React.ComponentClass<ALL_PROPS> | React.FunctionComponent<ALL_PROPS>): React.FunctionComponent<RAW_PROPS> {
    // eslint-disable-next-line react/display-name
    return (props: RAW_PROPS) => {
        return (
            <AppContextConsumer>
                {value => <Component {...Object.assign({} as ALL_PROPS, props, { appContext: value })} />}
            </AppContextConsumer>
        );
    };
}
