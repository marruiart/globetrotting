import { createReducer, on } from '@ngrx/store';
import * as UserActions from './user.actions';
import { Client } from '../../models/globetrotting/client.interface';
import { User } from '../../models/globetrotting/user.interface';
import { Agent } from '../../models/globetrotting/agent.interface';

export const USER_FEATURE_KEY = 'user'

export interface UserState {
    extendedUser: User | null,
    client: Client | null,
    agent: Agent | null
}

export const initialState: UserState = {
    extendedUser: null,
    client: null,
    agent: null,
}

export const userReducer = createReducer(
    initialState,
    on(UserActions.initAssignUserData, (state) => ({ ...state })),
    on(UserActions.assignUserData, (state, { data }) => ({ ...state, extendedUser: data.extendedUser, client: data.client, agent: data.agent })),
    on(UserActions.assignUserDataSuccess, (state) => ({ ...state })),
    on(UserActions.assignUserDataFailure, (state, { error }) => ({ ...state, error: error }))
);