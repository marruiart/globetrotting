import { createFeatureSelector, createSelector } from "@ngrx/store";
import { AUTH_FEATURE_KEY, AuthState } from "./auth.reducer";

export const selectFeature = createFeatureSelector<AuthState>(AUTH_FEATURE_KEY);
export const selectCurrentRole = createSelector(selectFeature, (state: AuthState) => state.role);
export const selectCurrentUserId = createSelector(selectFeature, (state: AuthState) => state.user_id);
export const selectCurrentExtendedUserId = createSelector(selectFeature, (state: AuthState) => state.extended_id);
export const selectCurrentClientId = createSelector(selectFeature, (state: AuthState) => state.client_id);
export const selectCurrentAgentId = createSelector(selectFeature, (state: AuthState) => state.agent_id);
export const selectCurrentUser = createSelector({
    user_id: selectCurrentUserId,
    extended_id: selectCurrentExtendedUserId,
    client_id: selectCurrentClientId,
    agent_id: selectCurrentAgentId,
    role: selectCurrentRole
});