import { createReducer, on } from '@ngrx/store';
import * as FavoritesActions from './favorites.actions';
import { ClientFavDestination, Fav } from '../../models/globetrotting/fav.interface';

export const FAVORITES_FEATURE_KEY = 'favorites'

export type Sizes = {
    [collection: string]: number;
}

export type FavoritesState = {
    clientFavs: ClientFavDestination[]
    error: any | null
}

export const initialState: FavoritesState = {
    clientFavs: [],
    error: null
};

export const favoritesReducer = createReducer(
    initialState,
    on(FavoritesActions.assignClientFavsSuccess, (state, { clientFavs }) => ({ ...state, clientFavs: [...clientFavs], error: null })),
    on(FavoritesActions.assignClientFavsFailure, (state, { error }) => ({ ...state, error: error })),
    on(FavoritesActions.addFavSuccess, (state) => ({ ...state, error: null })),
    on(FavoritesActions.addFavFailure, (state, { error }) => ({ ...state, error: error })),
    on(FavoritesActions.deleteFavSuccess, (state) => ({ ...state, error: null })),
    on(FavoritesActions.deleteFavFailure, (state, { error }) => ({ ...state, error: error })),
    on(FavoritesActions.logout, (_) => ({ ...initialState })),
);