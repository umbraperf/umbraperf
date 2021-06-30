import * as model from '../model';
import { AppState } from './state';

/// A mutation
export type StateMutation<T, P> = {
    readonly type: T;
    readonly data: P;
};

/// A mutation type
export enum StateMutationType {
    SET_GREETER = 'SET_GREETER',
    OTHER = 'OTHER',
}

/// An state mutation variant
export type StateMutationVariant =
    | StateMutation<StateMutationType.SET_GREETER, string>
    ;

// The action dispatch
export type Dispatch = (mutation: StateMutationVariant) => void;
/// Mutation of the application state
export class AppStateMutation {
    /// Set the editor program
    public static reduce(state: AppState, mutation: StateMutationVariant): AppState {
        switch (mutation.type) {
            case StateMutationType.SET_GREETER:
                return {
                    ...state,
                    helloworld: mutation.data,
                };
        }
    }
}
