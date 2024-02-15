import { createFeatureSelector, createSelector } from "@ngrx/store";
import { AUTH_FEATURE_KEY, AuthState } from "./auth.reducer";
import { AuthUser } from "../../models/globetrotting/auth.interface";
import { AgentUser, ClientUser, User } from "../../models/globetrotting/user.interface";
import { Booking, ClientBooking } from "../../models/globetrotting/booking.interface";
import { ClientFavDestination } from "../../models/globetrotting/fav.interface";

export const selectFeature = createFeatureSelector<AuthState>(AUTH_FEATURE_KEY);
export const selectAuthUser = createSelector(selectFeature, (state: AuthState): AuthUser | null => {
    return (state.user_id && state.role) ? {
        user_id: state.user_id ?? 0,
        role: state.role ?? 'AUTHENTICATED'
    } : null
});
export const selectRole = createSelector(selectFeature, (state: AuthState) => state.role);
export const selectUserId = createSelector(selectFeature, (state: AuthState) => state.user_id);
export const selectLoggedState = createSelector(selectFeature, (state: AuthState) => state.isLogged);
export const selectError = createSelector(selectFeature, (state: AuthState) => state.error);
export const selectUser = createSelector(selectFeature, (state: AuthState): User | null => {
    if (state.role === 'AUTHENTICATED') {
        return {
            role: state.role,
            user_id: state.user_id,
            ext_id: state.ext_id,
            specific_id: state.specific_id,
            email: state.email,
            nickname: state.nickname,
            avatar: state.avatar,
            name: state.name,
            surname: state.surname,
            age: state.age,
            bookings: (state.bookings ?? []) as ClientBooking[],
            favorites: (state.favorites ?? []) as ClientFavDestination[]
        } as ClientUser
    } else if (state.role === 'ADMIN' || state.role === 'AGENT'){
        return {
            role: state.role,
            user_id: state.user_id,
            ext_id: state.ext_id,
            specific_id: state.specific_id,
            email: state.email,
            nickname: state.nickname,
            avatar: state.avatar,
            name: state.name,
            surname: state.surname,
            age: state.age,
            bookings: (state.bookings ?? []) as Booking[]
        } as AgentUser
    } else {
        return null;
    }

});
export const selectUserNickname = createSelector(selectFeature, (state: AuthState) => state.nickname);
export const selectUserAvatar = createSelector(selectFeature, (state: AuthState) => state.avatar);
export const selectUserBookings = createSelector(selectFeature, (state: AuthState) => state.bookings);
export const selectUserFavorites = createSelector(selectFeature, (state: AuthState) => state.favorites);