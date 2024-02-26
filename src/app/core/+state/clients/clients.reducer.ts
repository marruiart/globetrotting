import { createReducer, on } from '@ngrx/store';
import * as ClientsActions from './clients.actions';
import { User } from '../../models/globetrotting/user.interface';

export const CLIENTS_FEATURE_KEY = 'clients'

export type ClientsState = {
    clients: User[]
    error: any | null
}

export const initialState: ClientsState = {
    clients: [],
    error: null
};

export const clientsReducer = createReducer(
    initialState,
    on(ClientsActions.saveClientUsersSuccess, (state, { clients }) => ({ ...state, clients: [...clients], error: null })),
    on(ClientsActions.saveClientUsersFailure, (state, { error }) => ({ ...state, error: error })),
    on(ClientsActions.logout, (_) => ({ ...initialState })),
);