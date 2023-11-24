import { createFeatureSelector, createSelector } from "@ngrx/store";
import { AUTH_FEATURE_KEY, AuthState } from "./auth.reducer";

export const selectFeature = createFeatureSelector<AuthState>(AUTH_FEATURE_KEY);
export const selectCurrentUserRole = createSelector(selectFeature, (state: AuthState) => state.role);
export const selectCurrentUser = createSelector(selectFeature, (state: AuthState) => state.user_id);