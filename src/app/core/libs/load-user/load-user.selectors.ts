import { createFeatureSelector, createSelector } from "@ngrx/store";
import { USER_FEATURE_KEY, UserState } from "./load-user.reducer";
import { selectCurrentRole, selectCurrentUserId } from "../auth/auth.selectors";

export const selectFeature = createFeatureSelector<UserState>(USER_FEATURE_KEY);
export const selectCurrentExtendedUser = createSelector(selectFeature, (state: UserState) => state.extendedUser);
export const selectCurrentSpecificUser = createSelector(selectFeature, (state: UserState) => state.specificUser);
export const selectCurrentUser = createSelector({
    user_id: selectCurrentUserId,
    role: selectCurrentRole,
    extendedUser: selectCurrentExtendedUser,
    specificUser: selectCurrentSpecificUser,
});