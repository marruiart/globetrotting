import { createReducer, on } from '@ngrx/store';
import * as FirebaseActions from './firebase.actions';

export const FIREBASE_FEATURE_KEY = 'firebase'

export type Sizes = {
    [collection: string]: number;
}

export type FirebaseState = {
    sizes: Sizes
    error: any | null
}

export const initialState: FirebaseState = {
    sizes: {},
    error: null
};

export const firebaseReducer = createReducer(
    initialState,
    on(FirebaseActions.initSizesSuccess, (state, { sizes }) => ({ ...state, sizes: sizes, error: null })),
    on(FirebaseActions.initSizesFailure, (state, { error }) => ({ ...state, error: error })),
    on(FirebaseActions.updateSizesSuccess, (state, { collection }) => ({ ...state, sizes: { ...state.sizes, ...{ [collection]: state.sizes[collection] + 1 ?? 0 } }, error: null })),
    on(FirebaseActions.updateSizesFailure, (state, { error }) => ({ ...state, error: error }))
);