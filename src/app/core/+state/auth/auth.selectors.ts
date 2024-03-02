import { createFeatureSelector, createSelector } from "@ngrx/store";
import { AUTH_FEATURE_KEY, AuthState } from "./auth.reducer";
import { AgentUser, ClientUser, AdminAgentOrClientUser } from "../../models/globetrotting/user.interface";
import { ClientFavDestination } from "../../models/globetrotting/fav.interface";
import { Roles } from "../../utilities/utilities";

export const selectFeature = createFeatureSelector<AuthState>(AUTH_FEATURE_KEY);
export const selectRole = createSelector(selectFeature, (state: AuthState) => state.role);
export const selectUserId = createSelector(selectFeature, (state: AuthState) => state.user_id);
export const selectLoggedState = createSelector(selectFeature, (state: AuthState) => state.isLogged);
export const selectError = createSelector(selectFeature, (state: AuthState) => state.error);
export const selectCurrentUser = createSelector(selectFeature, (state: AuthState): AdminAgentOrClientUser | null => {
    if (state.role === Roles.AUTHENTICATED) {
        return {
            role: state.role,
            user_id: state.user_id,
            ext_id: state.ext_id,
            specific_id: state.specific_id,
            email: state.email,
            nickname: state.nickname,
            username: state.username,
            avatar: state.avatar,
            name: state.name,
            surname: state.surname,
            age: state.age,
            favorites: (state.favorites ?? []) as ClientFavDestination[]
        } as ClientUser
    } else if (state.role === Roles.ADMIN || state.role === Roles.AGENT){
        return {
            role: state.role,
            user_id: state.user_id,
            ext_id: state.ext_id,
            specific_id: state.specific_id,
            email: state.email,
            nickname: state.nickname,
            username: state.username,
            avatar: state.avatar,
            name: state.name,
            surname: state.surname,
            age: state.age,
        } as AgentUser
    } else {
        return null;
    }

});
export const selectUserNickname = createSelector(selectFeature, (state: AuthState) => state.nickname);
export const selectUserAvatar = createSelector(selectFeature, (state: AuthState) => state.avatar);
export const selectUserFavorites = createSelector(selectFeature, (state: AuthState) => state.favorites);