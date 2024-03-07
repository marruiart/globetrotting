import { createReducer, on } from '@ngrx/store';
import * as AuthActions from './auth.actions';
import { ClientUser, AdminAgentOrClientUser } from '../../models/globetrotting/user.interface';
import { Firebase, Role, isType } from '../../utilities/utilities';
import { ClientFavDestination } from '../../models/globetrotting/fav.interface';
import { CurrentBackend } from 'src/environments/environment';

export const AUTH_FEATURE_KEY = 'auth'

export type AuthState = {
    isLogged: boolean,
    user_id: (string | number) | null,
    ext_id: (string | number) | null,
    specific_id: (string | number) | null,
    role: Role | null,
    nickname: string,
    email: string,
    avatar?: any,
    name?: string,
    surname?: string,
    username?: string,
    age?: string,
    favorites?: ClientFavDestination[]
    error: any | null
}

export const initialState: AuthState = {
    isLogged: false,
    user_id: null,
    ext_id: null,
    specific_id: null,
    nickname: '',
    email: '',
    role: null,
    avatar: undefined,
    name: undefined,
    surname: undefined,
    username: undefined,
    age: undefined,
    favorites: undefined,
    error: null
};

export const authReducer = createReducer(
    initialState,
    on(AuthActions.loginSuccess, (state) => ({ ...state, isLogged: true, error: null })),
    on(AuthActions.loginFailure, (state, { error }) => ({ ...state, isLogged: false, role: null, user_id: null, error: error })),

    on(AuthActions.updateUser, (state, { user }) => userMapping(state, user)),
    on(AuthActions.assignUserSuccess, (state, { user }) => userMapping(state, user)), // TODO map all the user input
    on(AuthActions.assignUserFailure, (state, { error }) => ({ ...state, error: error })),


    on(AuthActions.logout, (state) => ({ ...state })),
    on(AuthActions.logoutSuccess, (_) => ({ ...initialState })),
    on(AuthActions.logoutFailure, (state, { error }) => ({ ...state, error: error })),

    on(AuthActions.register, (state) => ({ ...state })),
    on(AuthActions.registerSuccess, (state) => ({ ...state, isLogged: true, error: null })),
    on(AuthActions.registerFailure, (_, { error }) => resetState(error))
);

function userMapping(state: AuthState, user: AdminAgentOrClientUser): AuthState {
    return {
        ...state,
        isLogged: true,
        user_id: (user.user_id as (CurrentBackend extends Firebase ? string : number)),
        ext_id: user.ext_id ?? user.user_id,
        specific_id: user.specific_id ?? user.user_id,
        nickname: user.nickname,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        name: user.name,
        surname: user.surname,
        username: user.username,
        age: user.age,
        favorites: isType<ClientUser>(user) ? user.favorites : undefined,
        error: null
    };
}

function resetState(error?: any): AuthState {
    return {
        ...initialState,
        error: error ?? null
    }
}