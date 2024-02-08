import { createReducer, on } from '@ngrx/store';
import * as FavoritesActions from './favorites.actions';
import { ClientFavDestination, Fav, NewFav } from '../../models/globetrotting/fav.interface';
import { isType } from '../../utilities/utilities';
import { BACKEND, Strapi } from 'src/environments/environment';

export const FAVORITES_FEATURE_KEY = 'favorites'

export type Sizes = {
    [collection: string]: number;
}

export type FavoritesState = {
    specific_id: string | number | null
    clientFavs: ClientFavDestination[]
    error: any | null
}

export const initialState: FavoritesState = {
    specific_id: null,
    clientFavs: [],
    error: null
};

export const favoritesReducer = createReducer(
    initialState,
    on(FavoritesActions.assignClientFavsSuccess, (state, { clientFavs }) => ({ ...state, clientFavs: [...clientFavs], error: null })),
    on(FavoritesActions.assignClientFavsFailure, (state, { error }) => ({ ...state, error: error })),
    on(FavoritesActions.addFavSuccess, (state, { fav }) => ({ ...state, clientFavs: addFav(fav, state), error: null })),
    on(FavoritesActions.addFavFailure, (state, { error }) => ({ ...state, error: error })),
    on(FavoritesActions.deleteFavSuccess, (state, { id }) => ({ ...state, clientFavs: deleteFav(id, state.clientFavs), error: null })),
    on(FavoritesActions.deleteFavFailure, (state, { error }) => ({ ...state, error: error })),
);

function addFav(fav: Fav, state: FavoritesState): ClientFavDestination[] {
    const clientFav: ClientFavDestination = { fav_id: fav.id, destination_id: fav.destination_id ?? '' };
    return [...state.clientFavs, clientFav];
}

function deleteFav(id: string | number, clientFavs: ClientFavDestination[]): ClientFavDestination[] {
    let _clientFavs: ClientFavDestination[] = [];
    clientFavs.forEach(fav => {
        if (fav.fav_id != id) {
            _clientFavs.push(fav);
        }
    });
    return _clientFavs;
}