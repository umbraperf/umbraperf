import * as model from '../model';
import { AppState } from './state';
import { Result } from "./core_result";


/// A mutation
export type StateMutation<T, P> = {
    readonly type: T;
    readonly data: P;
};

/// A mutation type
export enum StateMutationType {
    SET_FILENAME = 'SET_FILENAME',
    SET_RESULTLOADING = 'SET_RESULTLOADING',
    SET_RESULT = 'SET_RESULT',
    SET_CHUNKSNUMBER = 'SET_CHUNKSNUMBER',
    SET_FILE = 'SET_FILE',
    SET_EVENTS = 'SET_EVENTS',
    RESET_STATE = 'RESET_STATE',
    OTHER = 'OTHER',
}

/// An state mutation variant
export type StateMutationVariant =
    | StateMutation<StateMutationType.SET_FILENAME, string>
    | StateMutation<StateMutationType.SET_RESULTLOADING, boolean>
    | StateMutation<StateMutationType.SET_RESULT, Result | undefined>
    | StateMutation<StateMutationType.SET_CHUNKSNUMBER, number>
    | StateMutation<StateMutationType.SET_FILE, File>
    | StateMutation<StateMutationType.SET_EVENTS, Array<string>>
    | StateMutation<StateMutationType.RESET_STATE, undefined>
    ;

// The action dispatch
export type Dispatch = (mutation: StateMutationVariant) => void;
/// Mutation of the application state
export class AppStateMutation {
    public static reduce(state: AppState, mutation: StateMutationVariant): AppState {
        switch (mutation.type) {
            case StateMutationType.SET_FILENAME:
                return {
                    ...state,
                    fileName: mutation.data,
                };
            case StateMutationType.SET_RESULTLOADING:
                return {
                    ...state,
                    resultLoading: mutation.data,
                };
            case StateMutationType.SET_RESULT:
                return {
                    ...state,
                    result: mutation.data,
                };
            case StateMutationType.SET_CHUNKSNUMBER:
                return {
                    ...state,
                    chunksNumber: mutation.data,
                };
            case StateMutationType.SET_FILE:
                return {
                    ...state,
                    file: mutation.data,
                };
            case StateMutationType.SET_EVENTS:
                return {
                    ...state,
                    events: mutation.data,
                }
            case StateMutationType.RESET_STATE:
                return {
                    ...state,
                    fileName: undefined,
                    resultLoading: false,
                    result: undefined,
                    chunksNumber: 0,
                    events: undefined,
                    file: undefined,
                }
        }
    }
}
