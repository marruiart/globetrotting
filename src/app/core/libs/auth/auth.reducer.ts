import { createReducer, on } from '@ngrx/store';
import * as AuthAction from './auth.actions';

export const AUTH_FEATURE_KEY = 'auth'

export interface AuthState {
    isLogged: Boolean,
    role: string | null,
    user_id: number | null,
    extended_id: number | null,
    client_id: number | null,
    agent_id: number | null,
    error: any | null
}

export const initialState: AuthState = {
    isLogged: false,
    role: null,
    user_id: null,
    extended_id: null,
    client_id: null,
    agent_id: null,
    error: null
}

export const authReducer = createReducer(
    initialState,
    on(AuthAction.init, (state) => ({ ...state })),
    on(AuthAction.login, (state) => ({ ...state })),
    on(AuthAction.loginSuccess, (state) => ({ ...state, isLogged: true })),
    on(AuthAction.assignRole, (state, { user }) => ({
        isLogged: true,
        role: user.role,
        user_id: user.user_id,
        extended_id: user.extended_id,
        client_id: user.client_id,
        agent_id: user.agent_id,
        error: null
    })),
    on(AuthAction.loginFailure, (state, { error }) => ({ ...state, isLogged: false, role: null, error: error })),
    on(AuthAction.logout, (state) => ({ ...state })),
    on(AuthAction.logoutSuccess, (state) => ({
        isLogged: false,
        role: null,
        user_id: null,
        extended_id: null,
        client_id: null,
        agent_id: null,
        error: null
    })),
    on(AuthAction.logoutFailure, (state, { error }) => ({ ...state, error: error })),
    on(AuthAction.register, (state) => ({ ...state })),
    on(AuthAction.registerSuccess, (state) => ({ ...state, isLogged: true }))
);