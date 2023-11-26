import { createFeatureSelector, createSelector } from "@ngrx/store";
import { USER_FEATURE_KEY, UserState } from "./user.reducer";

export const selectFeature = createFeatureSelector<UserState>(USER_FEATURE_KEY);
export const selectCurrentExtendedUser = createSelector(selectFeature, (state: UserState) => state.extendedUser);
export const selectCurrentClient = createSelector(selectFeature, (state: UserState) => state.client);
export const selectCurrentAgent = createSelector(selectFeature, (state: UserState) => state.agent);
export const selectCurrentUser = createSelector({
    extendedUser: selectCurrentExtendedUser,
    client: selectCurrentClient,
    agent: selectCurrentAgent,
});