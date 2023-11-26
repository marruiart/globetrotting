import { createReducer, on } from '@ngrx/store';
import * as UserActions from './load-user.actions';
import { Client } from '../../models/globetrotting/client.interface';
import { User } from '../../models/globetrotting/user.interface';
import { Agent } from '../../models/globetrotting/agent.interface';

export const USER_FEATURE_KEY = 'user'

export interface UserState {
    extendedUser: User | null,
    specificUser: Client | Agent | null
}

export const initialState: UserState = {
    extendedUser: null,
    specificUser: null
}

export const userReducer = createReducer(
    initialState,
    on(UserActions.loadUser, (state) => ({ ...state })),
    on(UserActions.assignExtendedUser, (state, { user }) => ({ ...state, extendedUser: user.extendedUser })),
    on(UserActions.assignSpecificUser, (state, { user }) => ({ ...state, specificUser: user.specificUser })),
    on(UserActions.loadUserSuccess, (state) => ({ ...state })),
    on(UserActions.loadUserFailure, (state, { error }) => ({ ...state, error: error }))
);