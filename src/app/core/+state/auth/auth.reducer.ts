import { createReducer, on } from '@ngrx/store';
import * as AuthActions from './auth.actions';
import { Backend, Firebase } from 'src/environments/environment';
import { ClientUser, Role, AdminAgentOrClientUser } from '../../models/globetrotting/user.interface';
import { Booking } from '../../models/globetrotting/booking.interface';
import { isType } from '../../utilities/utilities';
import { ClientFavDestination } from '../../models/globetrotting/fav.interface';
import { ClientBooking } from '../../models/globetrotting/booking.interface';

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
    age?: string,
    bookings?: ClientBooking[] | Booking[],
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
    error: null
};

export const authReducer = createReducer(
    initialState,
    on(AuthActions.loginSuccess, (state) => ({ ...state, isLogged: true, error: null })),
    on(AuthActions.loginFailure, (state, { error }) => ({ ...state, isLogged: false, role: null, user_id: null, error: error })),
    on(AuthActions.assignUid, (state, { user_id }) => ({ ...state, isLogged: true, user_id: user_id, error: null })),
    on(AuthActions.assignUserSuccess, (state, { user }) => assignUserMapping(state, user)), // TODO map all the user input
    on(AuthActions.assignUserFailure, (state, { error }) => ({ ...state, error: error })),
    on(AuthActions.updateUser, (state, { user }) => updateUserMapping(state, user)),
    on(AuthActions.logout, (state) => ({ ...state })),
    on(AuthActions.logoutSuccess, (state) => ({ ...state, isLogged: false, role: null, user_id: null, error: null })),
    on(AuthActions.logoutFailure, (state, { error }) => ({ ...state, error: error })),
    on(AuthActions.register, (state) => ({ ...state })),
    on(AuthActions.registerSuccess, (state) => ({ ...state, isLogged: true, error: null })),
    on(AuthActions.registerFailure, (_, { error }) => resetState(error))
);

function assignUserMapping(state: AuthState, user: AdminAgentOrClientUser): AuthState {
    return {
        ...state,
        isLogged: true,
        user_id: (user.user_id as (Backend extends Firebase ? string : number)),
        ext_id: user.ext_id ?? user.user_id,
        specific_id: user.specific_id ?? user.user_id,
        nickname: user.nickname,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        name: user.name,
        surname: user.surname,
        age: user.age,
        favorites: isType<ClientUser>(user) ? user.favorites : undefined,
        error: null
    };
}

function updateUserMapping(state: AuthState, user: AdminAgentOrClientUser): AuthState {
    return {
        ...state,
        email: user?.email ?? '',
        favorites: isType<ClientUser>(user) ? user.favorites : undefined,
        name: user.name,
        nickname: user.nickname,
        role: user.role,
        surname: user.surname,
    }
}

function resetState(error?: any): AuthState {
    return {
        ...initialState,
        error: error ?? null
    }
}