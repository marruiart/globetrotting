import { createReducer, on } from '@ngrx/store';
import * as AuthAction from './auth.actions';
import { Backend, Firebase } from 'src/environments/environment';
import { ClientUser, Role, User } from '../../models/globetrotting/user.interface';
import { Booking } from '../../models/globetrotting/booking.interface';
import { isType } from '../../utilities/utilities';
import { ClientFavDestination } from '../../models/globetrotting/fav.interface';
import { ClientBooking } from '../../models/globetrotting/client.interface';

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
    on(AuthAction.loginSuccess, (state) => ({ ...state, isLogged: true, error: null })),
    on(AuthAction.loginFailure, (state, { error }) => ({ ...state, isLogged: false, role: null, user_id: null, error: error })),
    on(AuthAction.assignUid, (state, { user_id }) => ({ ...state, isLogged: true, user_id: user_id, error: null })),
    on(AuthAction.assignUserSuccess, (state, { user }) => assignUserMapping(state, user)), // TODO map all the user input
    on(AuthAction.assignUserFailure, (state, { error }) => ({ ...state, error: error })),
    on(AuthAction.logout, (state) => ({ ...state })),
    on(AuthAction.logoutSuccess, (state) => ({ ...state, isLogged: false, role: null, user_id: null, error: null })),
    on(AuthAction.logoutFailure, (state, { error }) => ({ ...state, error: error })),
    on(AuthAction.register, (state) => ({ ...state })),
    on(AuthAction.registerSuccess, (state) => ({ ...state, isLogged: true, error: null })),
    on(AuthAction.registerFailure, (state, { error }) => ({ ...state, isLogged: false, role: null, user_id: null, error: error }))
);

function assignUserMapping(state: AuthState, user: User): AuthState {
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
        bookings: user.bookings,
        favorites: isType<ClientUser>(user) ? user.favorites : undefined,
        error: null
    }
}