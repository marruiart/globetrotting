import { createFeatureSelector, createSelector } from "@ngrx/store";
import { AUTH_FEATURE_KEY, AuthState, FirebaseAuthState, StrapiAuthState } from "./auth.reducer";
import { isType } from "../../utilities/utilities";

function getUserId(state: AuthState) {
    return isType<FirebaseAuthState>(state) ? (state as FirebaseAuthState).uid : (state as StrapiAuthState).user_id;
}

export const selectFeature = createFeatureSelector<AuthState>(AUTH_FEATURE_KEY);
export const selectCurrentRole = createSelector(selectFeature, (state: AuthState) => state.role);
export const selectCurrentUserId = createSelector(selectFeature, (state: AuthState) => getUserId(state));
export const selectLoggedState = createSelector(selectFeature, (state: AuthState) => state.isLogged);