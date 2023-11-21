import { createReducer, on } from '@ngrx/store';
import * as AuthAction from './auth.actions';

export const AUTH_FEATURE_KEY = 'auth'

export interface AuthState {
    isLogged: Boolean,
    role: string | null,
    error: any | null
}

export const initialState: AuthState = {
    isLogged: false,
    role: null,
    error: null
}

export const authReducer = createReducer(
    initialState,
    on(AuthAction.login, (state) => ({ ...state })),
    on(AuthAction.loginSuccess, (state) => ({ ...state, isLogged: true })),
    on(AuthAction.assignRole, (state, { user }) => ({ isLogged: true, role: user.role, error: null })),
    on(AuthAction.loginFailure, (state, { error }) => ({ isLogged: false, role: null, error: error })),
    on(AuthAction.logout, (state) => ({ isLogged: false, role: null, error: null })),
    on(AuthAction.register, (state) => ({ ...state })),
    on(AuthAction.registerSuccess, (state) => ({ ...state, isLogged: true }))
);