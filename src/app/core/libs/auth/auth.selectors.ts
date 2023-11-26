import { createFeatureSelector, createSelector } from "@ngrx/store";
import { AUTH_FEATURE_KEY, AuthState } from "./auth.reducer";

export const selectFeature = createFeatureSelector<AuthState>(AUTH_FEATURE_KEY);
export const selectCurrentRole = createSelector(selectFeature, (state: AuthState) => state.role);
export const selectCurrentUserId = createSelector(selectFeature, (state: AuthState) => state.user_id);