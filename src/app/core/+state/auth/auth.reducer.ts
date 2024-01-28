import { createReducer, on } from '@ngrx/store';
import * as AuthAction from './auth.actions';
import { BACKEND, Backend, BackendTypes, Firebase, Strapi } from 'src/environments/environment';
import { Role } from '../../models/globetrotting/user.interface';
import { AuthUser } from '../../models/globetrotting/auth.interface';
import { FirebaseAuthUser } from '../../models/firebase-interfaces/firebase-user.interface';
import { StrapiAuthUser } from '../../models/strapi-interfaces/strapi-user.interface';
import { isType } from '../../utilities/utilities';

export const AUTH_FEATURE_KEY = 'auth'


export type FirebaseAuthState = {
    isLogged: boolean,
    role: Role | null,
    uid: string | null,
    error: any | null
}

export type StrapiAuthState = {
    isLogged: boolean,
    role: Role | null,
    user_id: number | null,
    error: any | null
}

export type AuthState = Backend extends Firebase ? FirebaseAuthState : StrapiAuthState;

export const initialState: FirebaseAuthState | StrapiAuthState = (BACKEND === 'Firebase') ? {
    isLogged: false,
    role: null,
    uid: null,
    error: null
} : {
    isLogged: false,
    role: null,
    user_id: null,
    error: null
};

export const authReducer = isType<FirebaseAuthState>(initialState) ? createReducer(
    initialState,
    on(AuthAction.init, (state) => ({ ...state })),
    on(AuthAction.login, (state) => ({ ...state })),
    on(AuthAction.loginSuccess, (state) => ({ ...state, isLogged: true })),
    on(AuthAction.loginFailure, (state, { error }) => ({ ...state, isLogged: false, role: null, user_id: null, error: error })),
    on(AuthAction.assignUid, (state, { uid }) => ({ ...state, isLogged: true, uid: uid, error: null })),
    on(AuthAction.assignRole, (state) => ({ ...state })),
    on(AuthAction.assignRoleSuccess, (state, { user }) => ({ ...state, isLogged: true, role: user.role, uid: (user as FirebaseAuthUser).uid, error: null })),
    on(AuthAction.logout, (state) => ({ ...state })),
    on(AuthAction.logoutSuccess, (state) => ({ ...state, isLogged: false, role: null, uid: null, error: null })),
    on(AuthAction.logoutFailure, (state, { error }) => ({ ...state, error: error })),
    on(AuthAction.register, (state) => ({ ...state })),
    on(AuthAction.registerSuccess, (state) => ({ ...state, isLogged: true })),
    on(AuthAction.registerFailure, (state, { error }) => ({ ...state, isLogged: false, role: null, uid: null, error: error }))
) : createReducer(
    initialState,
    on(AuthAction.init, (state) => ({ ...state })),
    on(AuthAction.login, (state) => ({ ...state })),
    on(AuthAction.loginSuccess, (state) => ({ ...state, isLogged: true })),
    on(AuthAction.loginFailure, (state, { error }) => ({ ...state, isLogged: false, role: null, user_id: null, error: error })),
    on(AuthAction.assignRoleSuccess, (state, { user }) => ({ ...state, isLogged: true, role: user.role, user_id: (user as StrapiAuthUser).user_id, error: null })),
    on(AuthAction.logout, (state) => ({ ...state })),
    on(AuthAction.logoutSuccess, (state) => ({ ...state, isLogged: false, role: null, user_id: null, error: null })),
    on(AuthAction.logoutFailure, (state, { error }) => ({ ...state, error: error })),
    on(AuthAction.register, (state) => ({ ...state })),
    on(AuthAction.registerSuccess, (state) => ({ ...state, isLogged: true })),
    on(AuthAction.registerFailure, (state, { error }) => ({ ...state, isLogged: false, role: null, user_id: null, error: error }))
);